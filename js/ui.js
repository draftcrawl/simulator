function browserUI(game) {
    game.ee.on('run_start', () => {
        logger('=== Game Started ===');
        logger(`Dungeon Size: ${game.dungeonSize}`);
    });

    game.ee.on('scene_start', (evt) => {
        logger(`=== Scene ${evt.number}/${game.dungeonSize} (${evt.type}) ===`);
    });

    game.ee.on('game_over', () => {
        logger('=== Game Over ===');
        logger(`You lose!`);
    });

    game.ee.on('combat_round_start', (evt) => {
        logger(`>> Round ${evt.number}`);
    });

    game.ee.on('damaged', (evt) => {
        if ('attack' !== evt.type) return;
        logger(
            `${evt.source.name} (HP: ${getHitPointsText(evt.source)})
            attacks
            ${evt.target.name} (HP: ${getHitPointsText(evt.target)})
            and deals ${evt.amount} damage`
        );
    });

    game.ee.on('damaged', (evt) => {
        if ('trap' !== evt.type) return;
        logger(
            `${evt.target.name} stepped on a trap and took ${evt.amount} damage.`
        );
    });

    game.ee.on('combat_enemy_dies', (evt) => {
        logger(`The ${evt.enemy.name} dies.`);
    });

    game.ee.on('find_item', (evt) => {
        logger(`${game.player.name} find 1 ${evt.item}.`);
    });
}

const loggerElement = document.querySelector('#app');
function logger(msg) {
    const el = document.createElement('p');
    el.textContent = msg;
    loggerElement.appendChild(el);
    document.documentElement.scrollTop = 9999999;
}
