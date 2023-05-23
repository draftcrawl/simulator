const urlParams = new URLSearchParams(window.location.search);
const winrate = urlParams.get('winrate');
const mods = urlParams.getAll('mods');

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
                beforeInit: (game) => {
                    browserUI(game);
                    setupMods(game.args.mods);
                },
                mods,
            });
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
} else {
    const total = 200;
    const playerClass = getClass(winrate);
    global.state = {
        win: 0,
        lose: 0,
        total,
        count: 0,
    };

    loggerReset();
    // logger(`Simulating ${total} runs...`);

    function displayResults() {
        //loggerReset();
        // displayActionButtons(true, false, false);
        logger('=== Results ===');
        logger('Class: ' + playerClass.name);
        // if (mods.length > 0) logger('Mods: ' + mods.join(', '));
        const rate = ((state.win / state.total) * 100).toFixed(1);
        updateRateHistory(playerClass.id, rate);
        logger('Win Rate: ' + `${rate}% ${getRateHistory(playerClass.id)}`);
        setTimeout(() => reload(), 1000);
    }
    function updateRateHistory(classID, rate) {
        rate = Number(rate);
        if (!classID || Number.isNaN(rate)) return;
        const min = localStorage.getItem(`${classID}_winrate_min`);
        const max = localStorage.getItem(`${classID}_winrate_max`);
        if (!min || rate < min) {
            localStorage.setItem(`${classID}_winrate_min`, rate);
        }
        if (!max || rate > max) {
            localStorage.setItem(`${classID}_winrate_max`, rate);
        }
    }
    function getRateHistory(classID) {
        if (!classID) return;
        const min = localStorage.getItem(`${classID}_winrate_min`) || 0;
        const max = localStorage.getItem(`${classID}_winrate_max`) || 0;
        return `(${min}% ~ ${max}%)`;
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
            mods,
            playerClass: playerClass.id,
            actionInterval: 0,
            beforeInit: (game) => {
                // browserUI(game);
                setupMods(game.args.mods);
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
