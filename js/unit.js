let nextUID = 1;

function createUnitObject(data) {
    debugLog('creating', data.id);
    const values = deepClone(data);
    const obj = {
        ...values,
        uid: nextUID++,

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

    if ('object' === typeof obj.hitPoints) {
        obj.hitPoints = roll(obj.hitPoints.max, obj.hitPoints.min);
    }
    obj.hitPointsMax = obj.hitPoints;

    if (data.init) data.init(obj);
    return obj;
}

function createPlayer(id) {
    const obj = createUnitObject(getClass(id));
    obj.spells = {};
    obj.scrolls = {};
    obj.potions = 0;
    game.ee.emit('player_created', { player: obj });
    return obj;
}

function createCreature(id) {
    return createUnitObject(getCreature(id));
}

function createBoss() {
    return createUnitObject(data.boss);
}
