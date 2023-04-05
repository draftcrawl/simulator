const urlParams = new URLSearchParams(window.location.search);
const mult = urlParams.get('mult') | 0;

if (!mult) {
    createGame({
        seed: urlParams.get('seed'),
        gm: urlParams.get('gm'),
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: urlParams.get('i') || 25,
        beforeInit: browserUI,
    });
} else {
    if (mult <= 0) {
        throw new Error('query argument "mult" must be greater than zero');
    }
    const playerClass = urlParams.get('class') || undefined;
    if (!playerClass) {
        throw new Error('query argument "class" is mandatory with "mult"');
    }
    global.state = {
        win: 0,
        lose: 0,
        total: mult,
        dungeonSize: 0,
        count: 0,
    };
    function displayResults() {
        console.log('Class: ' + playerClass);
        console.log(
            'Average Dungeon Size: ' + Math.round(state.dungeonSize / state.win)
        );
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
            gm: urlParams.get('gm'),
            playerClass,
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
