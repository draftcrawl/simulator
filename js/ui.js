function browserUI(game) {
    game.ee.on('run_start', () => {
        logger('=== Game Started ===');
        logger(`Dungeon Size: ${game.dungeonSize}`);
        logger(`Class: ${game.player.name}`);
        logger(`HP: ${game.player.hitPointsMax}`);
        logger(`Attack: 1d6+${game.player.damage.bonus}`);
    });

    game.ee.on('scene_start', (evt) => {
        if (evt.type === 'boss') {
            logger(`======= Final Scene (${evt.type}) =======`);
        } else {
            logger(
                `======= Scene ${evt.number}/${game.dungeonSize} (${evt.type}) =======`
            );
        }
    });

    game.ee.on('game_over', () => {
        logger('=== Game Over ===');
        logger(`You lose!`);
    });

    game.ee.on('victory', () => {
        logger('=== VICTORY ===');
        logger(`You win!`);
    });

    game.ee.on('combat_start', (evt) => {
        logger(`${game.player.name} vs ${getCreatureGroupName(evt.enemies)}`);
    });

    game.ee.on('combat_round_start', (evt) => {
        logger(`> Round ${evt.number}`);
    });

    game.ee.on('damaged', (evt) => {
        if ('attack' !== evt.type) return;
        logger(
            `${evt.source.name} (HP: ${getHitPointsText(evt.source)})
            attacks
            ${evt.target.name} (HP: ${getHitPointsText(evt.target)})
            and deals ${evt.amount} damage.`
        );
    });

    game.ee.on('damaged', (evt) => {
        if ('trap' !== evt.type) return;
        logger(
            `${evt.target.name} stepped on a trap and took ${evt.amount} damage.`
        );
    });

    game.ee.on('enemy_dies', (evt) => {
        logger(`The ${evt.enemy.name} dies.`);
    });

    game.ee.on('find_item', (evt) => {
        logger(`${game.player.name} find 1 ${evt.item}.`);
        if ('potion' === evt.item) {
            logger(
                `${game.player.name} now has ${game.player.potions} potions.`
            );
        }
    });

    game.ee.on('recover_hit_points', (evt) => {
        if ('potion' === evt.type) {
            oldHitPoints = {
                hitPoints: evt.target.hitPoints - evt.amount,
                hitPointsMax: evt.target.hitPointsMax,
            };
            logger(
                `${evt.target.name} (${getHitPointsText(oldHitPoints)})
                drank a potion.`
            );
            logger(`${evt.target.name} now has ${evt.target.potions} potions.`);
        }
        logger(`${evt.target.name} restored ${evt.amount} HP.`);
    });
}

const loggerElement = document.querySelector('#app');
function logger(msg) {
    const el = document.createElement('p');
    el.textContent = msg;
    loggerElement.appendChild(el);
    document.documentElement.scrollTop = 9999999;
}
