async function createScene(type, args = {}) {
    type = getSceneType(type);
    game.scene.type = type;
    game.ee.emit('scene_start', { type, ...args });

    if ('combat' === type) {
        game.scene.allies = [game.player];
        if (args.boss) {
            await createBossBattle();
        } else {
            await createCombat();
        }
    } else if ('event' === type) {
        await createEvent();
    } else {
        throw new Error('Invalid scene type: ' + type);
    }

    game.ee.emit('scene_end', { type, ...args });
}

async function createCombat() {
    const player = game.player;
    const enemies = createCreatureGroup();
    let round = 1;

    game.scene.enemies = enemies;

    game.ee.emit('combat_start', { enemies });

    while (true) {
        await wait(game.args.actionInterval);

        game.ee.emit('combat_round_start', { number: round });

        for (let i = 0; i < player.maxActions; i++) {
            decidePlayerAction();
        }

        for (const unit of game.scene.allies) {
            if (unit.dead || 'class' === unit.type) continue;
            decideAllyAction(unit);
        }

        let allEnemiesDie = true;
        for (const enemy of enemies) {
            if (enemy.dead) continue;
            allEnemiesDie = false;
            await wait(game.args.actionInterval);
            decideEnemyAction(enemy);
            if (player.dead) break;
        }

        game.ee.emit('combat_round_end', { number: round });

        if (player.dead || allEnemiesDie) break;
        round++;
    }

    checkGameOver();
}

async function createBossBattle() {
    const player = game.player;
    const boss = createBoss();
    const enemies = [boss];
    let round = 1;

    game.scene.enemies = enemies;
    game.ee.emit('combat_start', { enemies, boss: true });

    while (true) {
        await wait(game.args.actionInterval);

        game.ee.emit('combat_round_start', { number: round, boss: true });

        decidePlayerAction();

        for (const unit of game.scene.allies) {
            if (unit.dead || 'class' === unit.type) continue;
            decideAllyAction(unit);
        }

        if (!boss.dead) {
            decideEnemyAction(boss);
        }

        game.ee.emit('combat_round_end', { number: round });

        if (player.dead || boss.dead) break;
        round++;
    }

    checkGameOver();
}

function createEvent() {
    const eventList = [
        findMagicScroll,
        findMagicScroll,
        findMagicScroll,
        findPotion,
        findPotion,
        dealTrapDamage,
    ];
    const selected = randomArrayItem(eventList);

    return selected();
}

function findPotion() {
    const player = game.player;

    player.potions++;
    game.ee.emit('find_item', {
        type: 'potion',
        id: 'potion',
        name: data.potion.name,
    });
    game.scene.foundPotion = true;

    if (player.hitPointsMax - player.hitPoints >= data.potion.recover) {
        return drinkPotion();
    } else if (player.hitPoints <= Math.floor(player.hitPointsMax / 2)) {
        return drinkPotion();
    }
}

function findMagicScroll() {
    spell = getSpell();
    game.player.scrolls[spell.id] = (game.player.scrolls[spell.id] || 0) + 1;
    game.ee.emit('find_item', {
        type: 'scroll',
        id: spell.id,
        name: `Scroll of ${spell.name}`,
    });
}

function dealTrapDamage() {
    const damage = getAttackDamage(data.trap);
    dealDamage(damage, game.player, null, 'trap');
    checkGameOver();
}
