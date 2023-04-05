const urlParams = new URLSearchParams(window.location.search);
const mult = urlParams.get('mult') | 0;

if (!mult) {
    createGame({
        seed: urlParams.get('seed'),
        gm: urlParams.get('gm'),
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: urlParams.get('i') || 100,
        beforeInit: browserUI,
    });
} else {
    global.state = {
        win: 0,
        lose: 0,
        total: mult,
        count: 0,
    };
    function displayResults() {
        console.log(
            'Win Rate:',
            `${state.win}/${state.total}`,
            `(${((state.win / state.total) * 100).toFixed(2)}%)`
        );
    }
    function simulate() {
        if (state.count === state.total) {
            return displayResults();
        }
        createGame({
            seed: urlParams.get('seed'),
            gm: urlParams.get('gm'),
            playerClass: urlParams.get('class') || undefined,
            debug: urlParams.get('debug'),
            actionInterval: 0,
            beforeInit: (game) => {
                // loggerReset();
                // browserUI(game);
                game.ee.on('game_over', () => {
                    state.lose++;
                    state.count++;
                    simulate();
                });
                game.ee.on('victory', () => {
                    state.win++;
                    state.count++;
                    simulate();
                });
            },
        });
    }
    simulate();
}
