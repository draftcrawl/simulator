// THE GAME
function createGame(playerClass = null) {
    window.game = {
        parts: {
            current: 1,
            max: 0,
        },
        scene: {
            type: null,
            enemies: null,
        },
        player: null,
        ee: null, // ee = event emittr
        init() {
            this.ee = createNanoEvents();
            if (!playerClass) {
                const classList = Object.keys(data.class);
                playerClass = randomArrayItem(classList);
                console.log(playerClass);
                console.log(classList);
            }
            this.player = createUnit(data.class[playerClass]);
            this.parts.max = roll() + 9;
        },
        createScene() {},
    };
    window.game.init();
    return window.game;
}

const loggerElement = document.querySelector('#app');

function logger(msg) {
    const el = document.createElement('p');
    el.textContent = msg;
    loggerElement.appendChild(el);
}

function roll(max = 6, min = 1) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomArrayItem(array) {
    const index = Math.floor(roll(array.length) - 1);
    return array[index];
}

function createUnit(data) {
    console.log('creating ' + data.id + '...');
    const obj = {
        data: data,
        hitPoints: data.hitPoints || null,
        damage: data.damage,
        id: data.id,
        flags: {},
        dead() {
            return this.hitPoints <= 0;
        },
    };

    if (data.init != null) data.init(obj);

    return obj;
}

function dealDamage(amount, target, source = null, type = 'attack') {
    source = source || { id: 'null:null', name: 'Null' };
    const eventData = { amount, type, source, target };
    game.ee.emit('damage', eventData);
    if (eventData.amount > 0) target.hitPoints -= eventData.amount;
    return eventData.amount;
}
