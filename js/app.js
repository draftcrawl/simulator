// document.addEventListener('alpine:init', () => {});

gameLoop();

async function gameLoop() {
    const urlParams = new URLSearchParams(window.location.search);
    createGame({
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
    });

    const player = game.player;
    const enemy = createCreature();

    logger(`${player.name} vs ${enemy.name}`);
    let rounds = 1;

    while (true) {
        logger(`=== Round ${rounds++} ===`);
        logger(`Player HP: ${player.hitPoints}`);
        logger(`Enemy HP: ${enemy.hitPoints}`);

        await wait(500);
        logger(`Player deals ${attack(player, enemy)} damage`);
        if (enemy.dead()) break;

        await wait(500);
        logger(`Enemy deals ${attack(enemy, player)} damage`);
        if (player.dead()) break;
    }

    if (player.dead()) {
        logger(`Enemy win!`);
    } else {
        logger(`Player win!`);
    }
}
