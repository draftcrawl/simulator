window.data = window.data || {};

// CLASSES
data.class = {};

data.class.swordman = {
    name: 'Swordman',
    type: 'class',
    id: 'swordman',
    hitPoints: 25,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // takes -1 damage from creatures
        game.ee.on('damage', function (evt) {
            if (evt.target.id === 'swordman' && evt.type === 'attack') {
                evt.amount -= 1;
            }
        });
    },
};

data.class.rogue = {
    name: 'Rogue',
    type: 'class',
    id: 'rogue',
    hitPoints: 22,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // deals double damage in peons and grunts
        game.ee.on('damage', function (evt) {
            if (['grunt', 'peon'].includes(evt.target.id)) {
                evt.amount *= 2;
            }
        });
    },
};

data.class.hunter = {
    name: 'Hunter',
    type: 'class',
    id: 'hunter',
    hitPoints: 20,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // deals +4 damage on first attack in every combat
        game.ee.on('damage', function (evt) {
            if (evt.source.id === 'hunter' && !evt.source.flags.attacked) {
                evt.source.flags.attacked = true;
                evt.amount += 4;
            }
        });
        game.ee.on('combat_begin', function (evt) {
            evt.source.flags.attacked = false;
        });
    },
};

data.class.wizard = {
    name: 'Wizard',
    type: 'class',
    id: 'wizard',
    hitPoints: 20,
    damage: {
        bonus: 0,
        fixed: false,
    },
    init(unit) {
        // learns 2 random spells on game init
        game.ee.on('game_init', function () {
            let count = 2;
            const playerSpells = game.player.spells;
            while (count > 0) {
                count--;
                const spell = getSpell();
                playerSpells[spell.name] = (playerSpells[spell.name] || 0) + 1;
                debugLog('the Wizard player learned', spell.name, 'spell');
            }
        });
    },
};

// CREATURES
data.creature = {};

data.creature.peon = {
    name: 'Peon',
    type: 'creature',
    id: 'peon',
    damage: {
        bonus: 2,
        fixed: true,
    },
    hitPoints: 4,
};

data.creature.grunt = {
    name: 'Grunt',
    type: 'creature',
    id: 'grunt',
    damage: {
        bonus: 3,
        fixed: true,
    },
    hitPoints: 12,
};

data.creature.brute = {
    name: 'Brute',
    type: 'creature',
    id: 'brute',
    damage: {
        bonus: 6,
        fixed: true,
    },
    hitPoints: 16,
};

// SPELLS
data.spell = {};

data.spell.fireball = {
    name: 'Fireball',
    type: 'spell',
    id: 'fireball',
};

data.spell.lightning = {
    name: 'Lightning',
    type: 'spell',
    id: 'lightning',
};

data.spell.freezingRay = {
    name: 'Freezing Ray',
    type: 'spell',
    id: 'freezingRay',
};

data.spell.summonBeast = {
    name: 'Summon Beast',
    type: 'spell',
    id: 'summonBeast',
};

data.spell.heal = {
    name: 'Heal',
    type: 'spell',
    id: 'heal',
};

data.spell.lifeSteal = {
    name: 'Life Steal',
    type: 'spell',
    id: 'lifeSteal',
};
