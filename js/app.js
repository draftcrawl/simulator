// document.addEventListener('alpine:init', () => {});

createGame('hunter');

const player = game.player;
const enemy = createUnit(data.creature.brute);

logger(`${player.data.name} vs ${enemy.data.name}`);
let rounds = 1;

while (true) {
    logger(`=== Round ${rounds++} ===`);
    logger(`Player HP: ${player.hitPoints}`);
    logger(`Enemy HP: ${enemy.hitPoints}`);

    logger(`Player deals ${attack(player, enemy)} damage`);
    if (enemy.dead()) break;

    logger(`Enemy deals ${attack(enemy, player)} damage`);
    if (player.dead()) break;
}

if (player.dead()) {
    logger(`Enemy win!`);
} else {
    logger(`Player win!`);
}
