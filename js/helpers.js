function isFunction(func) {
    return 'function' === typeof func ? func : false;
}

function debugLog(...args) {
    if (game.args.debug) console.log(...args);
}

function dealDamage(amount, target, source = null, type = null) {
    source = source || { id: 'null:null', name: 'Null' };
    type = type || null;
    const eventData = {
        amount,
        type,
        source: deepClone(source),
        target: deepClone(target),
    };
    game.ee.emit('damage:before', eventData);
    game.ee.emit('damage', eventData);
    game.ee.emit('damage:after', eventData);

    if (eventData.amount > 0) target.hitPoints -= eventData.amount;

    game.ee.emit('damaged', deepClone(eventData));

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

function createUnitObject(data) {
    debugLog('creating', data.id);
    const values = deepClone(data);
    const obj = {
        ...values,
        hitPointsMax: values.hitPoints,

        // use the .flags to store status and temporary informations
        flags: {},

        // check if a unit are alive or dead
        get dead() {
            return this.hitPoints <= 0;
        },

        // attack another unit
        attack(target) {
            return attack(this, target);
        },
    };
    if (data.init) data.init(obj);
    return obj;
}

function createPlayer(id) {
    const obj = createUnitObject(getClass(id));
    obj.spells = {};
    obj.scrolls = {};
    obj.potions = 0;
    return obj;
}

function createCreature(id) {
    return createUnitObject(getCreature(id));
}

function createCreatureGroup(index = -1) {
    const groupList = [
        ['peon'],
        ['peon', 'peon'],
        ['peon', 'peon', 'peon'],
        ['grunt'],
        ['grunt', 'peon', 'peon'],
        ['brute'],
    ];
    const group = [];
    const selected = groupList[index] || randomArrayItem(groupList);
    for (const id of selected) {
        group.push(createCreature(id));
    }
    return group;
}

function getCreatureGroupName(group) {
    const counter = {};
    const names = [];
    for (const creature of group) {
        counter[creature.name] = (counter[creature.name] || 0) + 1;
    }
    for (const name in counter) {
        const number = counter[name];
        const s = number > 1 && 'Peon' === name ? 's' : '';
        names.push(`${number} ${name + s}`);
    }
    return names.join(' and ');
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
    if (ms <= 0) return;
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}

function getSceneType(type = null) {
    const types = ['combat', 'event'];
    return types.includes(type) ? type : randomArrayItem(types);
}

function getHitPointsText(unit) {
    return `${Math.max(unit.hitPoints, 0)}/${unit.hitPointsMax}`;
}
