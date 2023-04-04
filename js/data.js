global.data = {};

// CLASSES
data.class = {};

data.class.swordman = {
    name: 'Swordman',
    type: 'class',
    id: 'swordman',
    hitPoints: 60,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // takes -1 damage from creatures
        game.ee.on('damage', function (evt) {
            if (evt.type === 'attack' && evt.target.id === 'swordman') {
                evt.amount -= 1;
            }
        });
        game.ee.on('min_attack_damage', function (evt) {
            if (evt.source.id !== 'swordman') {
                evt.amount -= 1;
            }
        });
        game.ee.on('max_attack_damage', function (evt) {
            if (evt.source.id !== 'swordman') {
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
            if ('attack' !== evt.type) return;
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
        game.ee.on('combat_start', function (evt) {
            game.player.flags.attacked = false;
        });
        game.ee.on('damage', function (evt) {
            if ('attack' !== evt.type) return;
            if (evt.source.id === 'hunter' && !game.player.flags.attacked) {
                debugLog('HUNTER FIRST ATTACK BONUS APPLIED!');
                game.player.flags.attacked = true;
                evt.amount += 4;
            }
        });
        game.ee.on('min_attack_damage', function (evt) {
            if (evt.source.id === 'hunter' && !evt.source.flags.attacked) {
                evt.amount += 4;
            }
        });
        game.ee.on('max_attack_damage', function (evt) {
            if (evt.source.id === 'hunter' && !evt.source.flags.attacked) {
                evt.amount += 4;
            }
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
        game.ee.on('player_created', function (evt) {
            let count = 2;
            const playerSpells = evt.player.spells;
            while (count-- > 0) {
                const spell = getSpell();
                playerSpells[spell.name] = (playerSpells[spell.name] || 0) + 1;
                debugLog('the Wizard player learned', spell.name, 'spell');
            }
        });
    },
};

data.class.monk = {
    name: 'Monk',
    type: 'class',
    id: 'monk',
    hitPoints: 22,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // hit 2 creatures at once
        game.ee.on('get_number_of_targets', function (evt) {
            if ('attack' !== evt.type) return;
            evt.quantity = 2;
        });
    },
};

data.class.alchemist = {
    name: 'Alchemist',
    type: 'class',
    id: 'alchemist',
    hitPoints: 20,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init(unit) {
        // start the game with 1 potion
        game.ee.on('player_created', function (evt) {
            evt.player.potions += 1;
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

// BOSS
data.boss = {
    name: 'Boss',
    type: 'creature',
    id: 'boss',
    damage: {
        bonus: 3,
        fixed: false,
    },
    hitPoints: {
        min: 25,
        max: 30,
    },
};

// SPELLS
data.spell = {};

data.spell.fireball = {
    name: 'Fireball',
    type: 'spell',
    id: 'fireball',
    cast(targets) {},
};

data.spell.lightning = {
    name: 'Lightning',
    type: 'spell',
    id: 'lightning',
    cast(targets) {},
};

data.spell.freezingRay = {
    name: 'Freezing Ray',
    type: 'spell',
    id: 'freezingRay',
    cast(targets) {},
};

data.spell.summonBeast = {
    name: 'Summon Beast',
    type: 'spell',
    id: 'summonBeast',
    cast(targets) {},
};

data.spell.heal = {
    name: 'Heal',
    type: 'spell',
    id: 'heal',
    heal: 10,
    cast(targets) {},
};

data.spell.lifeSteal = {
    name: 'Life Steal',
    type: 'spell',
    id: 'lifeSteal',
    cast(targets) {},
};

// POTION
data.item = {};

data.item.potion = {
    heal: 15,
};
