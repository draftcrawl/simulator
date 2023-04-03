// document.addEventListener('alpine:init', () => {});

gameLoop();

async function gameLoop() {
    const urlParams = new URLSearchParams(window.location.search);
    createGame({
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: 500,
    });

    const player = game.player;
    const enemies = createCreatureGroup();
    // debugLog(game.scene.enemies);
    // debugLog(getCreatureGroupName(game.scene.enemies));
    // debugLog(getTarget(game.scene.enemies));

    logger(`${player.name} vs ${getCreatureGroupName(enemies)}`);
    let rounds = 1;

    while (true) {
        await wait(game.args.actionInterval);
        const enemy = getTargets(enemies)[0];

        if (!enemy) break;

        logger(`=== Round ${rounds++} ===`);
        logger(`Player hitPoints: ${player.hitPoints}/${player.hitPointsMax}`);

        logger(
            `Player attack ${enemy.name} and
            deal ${player.attack(enemy)} damage`
        );

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
    }

    if (player.dead) {
        logger(`Enemies win!`);
    } else {
        logger(`Player win!`);
    }
}
