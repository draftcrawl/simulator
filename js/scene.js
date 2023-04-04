async function createScene(type, args = {}) {
    type = getSceneType(type);

    game.ee.emit('scene_start', { type, ...args });

    if ('combat' === type) {
        return createCombat();
    }
    if ('event' === type) {
        return createEvent();
    }
    if ('boss' === type) {
        return createBossFight();
    }
    throw new Error(`Invalid scene type: ${type}`);
}

async function createCombat() {
    const player = game.player;
    const enemies = createCreatureGroup();
    let round = 1;

    game.ee.emit('combat_start');

    while (true) {
        await wait(game.args.actionInterval);
        const enemy = getTargets(enemies)[0];

        if (!enemy) break;

        game.ee.emit('combat_round_start', { number: round });

        player.attack(enemy);

        if (enemy.dead) {
            game.ee.emit('combat_enemy_dies', { enemy });
        }

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            await wait(game.args.actionInterval);
            logger(
                `${enemy.name} attack the player and
                deal ${enemy.attack(player)} damage`
            );
            if (player.dead) break;
        }
        if (player.dead) break;

        round++;
    }
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

function createBossFight() {}

function findPotion() {
    game.ee.emit('find_item', { item: 'potion' });
}

function findMagicScroll() {
    spell = getSpell();

    game.ee.emit('find_item', { item: `scroll of ${spell.name}` });
}

function dealTrapDamage() {
    const damage = roll() + 4;
    dealDamage(damage, game.player, null, 'trap');
}
