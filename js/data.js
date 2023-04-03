window.data = window.data || {};

// CLASSES
data.class = {};

data.class.swordman = {
    name: 'Swordman',
    id: 'class:swordman',
    hitPoints: 25,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // takes -1 damage from creatures
        game.ee.on('damage', function (evt) {
            if (evt.target.id === 'class:swordman' && evt.type === 'attack') {
                evt.amount -= 1;
            }
        });
    },
};

data.class.rogue = {
    name: 'Rogue',
    id: 'class:rogue',
    hitPoints: 22,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {},
};

data.class.hunter = {
    name: 'Hunter',
    id: 'class:hunter',
    hitPoints: 20,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // deals +4 damage on first attack
        game.ee.on('damage', function (evt) {
            if (
                evt.source.id === 'class:hunter' &&
                !evt.source.flags.attacked
            ) {
                evt.source.flags.attacked = true;
                evt.amount += 4;
            }
        });
    },
};

// CREATURES
data.creature = {};

data.creature.peon = {
    name: 'Peon',
    id: 'creature:peon',
    damage: {
        bonus: 2,
        fixed: true,
    },
    hitPoints: 4,
};

data.creature.grunt = {
    name: 'Grunt',
    id: 'creature:grunt',
    damage: {
        bonus: 3,
        fixed: true,
    },
    hitPoints: 12,
};

data.creature.brute = {
    name: 'Brute',
    id: 'creature:brute',
    damage: {
        bonus: 6,
        fixed: true,
    },
    hitPoints: 16,
};
