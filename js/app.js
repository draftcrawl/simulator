const urlParams = new URLSearchParams(window.location.search);
const winrate = urlParams.get('winrate');

if (!winrate) {
    const playerClass = urlParams.get('class');
    seed = parseInt(urlParams.get('seed'), 10);

    if (!playerClass) {
        const painel = document.querySelector('.painel');
        painel.style.display = 'block';
        painel.querySelector('#game-seed').value = seed || '';
    } else {
        try {
            createGame({
                seed: seed,
                // gm: urlParams.get('gm'),
                playerClass: playerClass,
                debug: urlParams.get('debug'),
                actionInterval: urlParams.get('i') || 25,
                beforeInit: browserUI,
            });
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
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
        // displayActionButtons(true, false, false);
        logger('=== Results ===');
        logger('Class: ' + playerClass.name);
        logger(
            'Win Rate: ' + `${((state.win / state.total) * 100).toFixed(1)}%`
        );
        setTimeout(() => reload(), 1000);
    }
    function reload() {
        window.location = location.href;
    }
    function simulate() {
        if (state.count === state.total) {
            return displayResults();
        }
        createGame({
            // gm: urlParams.get('gm'),
            playerClass: playerClass.id,
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
