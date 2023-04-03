// THE GAME
function createGame(args) {
    window.game = {
        debug: !!args.debug,
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
            this.player = createPlayer(args.playerClass);
            this.parts.max = roll() + 9;
            this.ee.emit('game_init');
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
    document.documentElement.scrollTop = 9999999;
}

function debugLog(...args) {
    if (game.debug) console.log(...args);
}

function dealDamage(amount, target, source = null, type = 'attack') {
    source = source || { id: 'null:null', name: 'Null' };
    const eventData = { amount, type, source: deepClone(source), target: deepClone(target) };
    game.ee.emit('damage', eventData);
    if (eventData.amount > 0) target.hitPoints -= eventData.amount;
    return eventData.amount;
}

function roll(max = 6, min = 1) {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    debugLog(`roll [ ${min} ~ ${max} ] = ${result}`);
    return result;
}

function randomArrayItem(array) {
    const index = Math.floor(roll(array.length) - 1);
    return array[index];
}

function createPlayer(id) {
    const obj = createObject(getClass(id));
    obj.spells = {};
    obj.scrolls = {};
    obj.potions = 0;
    return obj;
}

function createCreature(id) {
    return createObject(getCreature(id));
}

function createObject(data) {
    debugLog('creating', data.id);
    const values = deepClone(data);
    const obj = {
        ...values,
        flags: {},
        dead() {
            return this.hitPoints <= 0;
        },
    };

    if (data.init) data.init(obj);
    return obj;
}

function getCreature(id = 'random') {
    const obj =
        'random' === id
            ? randomArrayItem(Object.values(data.creature))
            : data.creature[id];
    if (!obj) throw new Error(`Creature ${id} does not exist.`);
    return obj;
}

function getClass(id = 'random') {
    const obj =
        'random' === id
            ? randomArrayItem(Object.values(data.class))
            : data.class[id];
    if (!obj) throw new Error(`Class ${id} does not exist.`);
    return obj;
}

function getSpell(id = 'random') {
    const obj =
        'random' === id
            ? randomArrayItem(Object.values(data.spell))
            : data.spell[id];
    if (!obj) throw new Error(`Spell ${id} does not exist.`);
    return obj;
}

async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
