function isFunction(func) {
    return 'function' === typeof func ? func : false;
}

function debugLog(...args) {
    if (global.game && game.args.debug) console.log(...args);
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
    return renamePeons(group);
}

function getCreatureGroupName(group) {
    if (group.length === 1) {
        return group[0].name;
    }

    const counter = {};
    const names = [];
    for (const creature of group) {
        const name = creature.name.includes('Peon') ? 'Peon' : creature.name;
        counter[name] = (counter[name] || 0) + 1;
    }
    for (let name in counter) {
        name = name.includes('Peon') ? 'Peon' : name;
        const number = counter[name];
        const s = number > 1 ? 's' : '';
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

async function wait(ms) {
    if (ms <= 0) return;
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}

function getSceneType(type = null) {
    const types = ['combat', 'event'];
    return 'boss' === type || types.includes(type)
        ? type
        : randomArrayItem(types);
}

function getHitPointsText(unit) {
    return `${Math.max(unit.hitPoints, 0)}/${unit.hitPointsMax}`;
}

function renamePeons(group) {
    if (1 === group.length) return group;

    let i = 1;
    for (const unit of group) {
        if ('peon' === unit.id) {
            unit.name += `[${i++}]`;
        }
    }

    return group;
}

function recoverHitPoints(target, amount, type = null) {
    const old = target.hitPoints;
    target.hitPoints = Math.min(target.hitPoints + amount, target.hitPointsMax);
    game.ee.emit('recover_hit_points', {
        target,
        amount: target.hitPoints - old,
        absoluteAmount: amount,
        type,
    });
}

function checkGameOver() {
    if (game.player.dead) {
        game.ee.emit('game_over');
    }
}

function getSpell(id = 'random') {
    const obj =
        'random' === id
            ? randomArrayItem(Object.values(data.spell))
            : data.spell[id];
    if (!obj) throw new Error(`Spell ${id} does not exist.`);
    return obj;
}

// check if the player can cast a spell (learned or from scrolls)
function hasSpell(id) {
    const player = game.player;
    if (player.spellsLearned[id] > 0) {
        return (player.spellsCast[id] || 0) < (player.spellsLearned[id] || 0);
    }
    return (player.scrolls[id] || 0) > 0;
}
