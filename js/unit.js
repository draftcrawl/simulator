let nextUID = 1;

function createUnitObject(data) {
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
        attack(target, damage = null) {
            if (this.flags.stunned) {
                return game.ee.emit('unit_cant_attack', { unit: this });
            }
            return attack(this, target, damage);
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
    obj.spellsLearned = {};
    obj.spellsCast = {};
    obj.scrolls = {};
    obj.potions = 0;
    game.ee.emit('player_created', { player: obj });
    return obj;
}

function createCreature(id) {
    const obj = createUnitObject(getCreature(id));
    game.ee.emit('unit_created', { unit: obj });
    return obj;
}

function createBoss() {
    return createUnitObject(data.boss);
}

function createSummoning(data) {
    const obj = createUnitObject(data);
    obj.type = 'summoning';
    game.ee.emit('unit_summoned', { unit: obj });
    return obj;
}
