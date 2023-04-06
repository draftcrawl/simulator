const urlParams = new URLSearchParams(window.location.search);
const winrate = urlParams.get('winrate');

if (!winrate) {
    createGame({
        seed: urlParams.get('seed'),
        gm: urlParams.get('gm'),
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: urlParams.get('i') || 25,
        beforeInit: browserUI,
    });
} else {
    const total = 250;
    const playerClass = getClass(winrate);
    global.state = {
        win: 0,
        lose: 0,
        total,
        dungeonSize: 0,
        count: 0,
    };

    loggerReset();
    // logger(`Simulating ${total} runs...`);

    function displayResults() {
        //loggerReset();
        displayActionButtons(true, false, false);
        logger('=== Results ===');
        logger('Class: ' + playerClass.name);
        logger(
            'Win Rate: ' + `${((state.win / state.total) * 100).toFixed(1)}%`
        );
        setTimeout(() => reload(), 2000);
    }
    function reload() {
        window.location = location.href;
    }
    function simulate() {
        if (state.count === state.total) {
            return displayResults();
        }
        createGame({
            gm: urlParams.get('gm'),
            playerClass: playerClass.id,
            debug: urlParams.get('debug'),
            actionInterval: 0,
            beforeInit: (game) => {
                // browserUI(game);
                game.ee.on('game_over', () => {
                    state.lose++;
                    state.count++;
                    simulate();
                });
                game.ee.on('victory', () => {
                    state.win++;
                    state.count++;
                    state.dungeonSize += game.dungeonSize;
                    simulate();
                });
            },
        });
    }
    simulate();
}
