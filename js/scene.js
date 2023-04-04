async function createScene(type, args = {}) {
    type = getSceneType(type);
    game.scene.type = type;
    game.ee.emit('scene_start', { type, ...args });

    if ('combat' === type) {
        if (args.boss) {
            return createBossFight();
        }
        return createCombat();
    } else if ('event' === type) {
        return createEvent();
    } else {
        throw new Error('Invalid scene type: ' + type);
    }
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

        decidePlayerAction();

        let allEnemiesDie = true;
        for (const enemy of enemies) {
            if (enemy.dead) continue;
            allEnemiesDie = false;
            await wait(game.args.actionInterval);
            enemy.attack(player);
            if (player.dead) break;
        }

        if (player.dead || allEnemiesDie) break;

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

async function createBossFight() {
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

        if (!boss.dead) {
            boss.attack(player);
        }

        if (player.dead || boss.dead) break;

        round++;
    }

    checkGameOver();
}

function findPotion() {
    const player = game.player;

    player.potions++;
    game.ee.emit('find_item', { item: 'potion' });
    game.scene.foundPotion = true;

    if (player.hitPointsMax - player.hitPoints >= data.item.potion.heal) {
        return drinkPotion();
    }
}

function findMagicScroll() {
    spell = getSpell();
    game.player.scrolls[spell.id] = (game.player.scrolls[spell.id] || 0) + 1;
    game.ee.emit('find_item', { item: `scroll of ${spell.name}` });
}

function dealTrapDamage() {
    const damage = roll() + 4;
    dealDamage(damage, game.player, null, 'trap');
    checkGameOver();
}
