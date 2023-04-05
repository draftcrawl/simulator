global.data = {};

data.dungeonSize = () => roll() + 6;

// CLASSES
data.class = {};

data.class.swordman = {
    name: 'Swordman',
    type: 'class',
    id: 'swordman',
    hitPoints: 22,
    damage: {
        bonus: 1,
        fixed: false,
    },
    damageReduction: 1,
    init() {
        // takes -1 damage from creatures
        game.ee.on('damage', function (evt) {
            if (evt.type === 'attack' && evt.target.id === 'swordman') {
                evt.amount -= data.class.swordman.damageReduction;
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
    hitPoints: 20,
    damage: {
        bonus: 2,
        fixed: false,
    },
    doubleDamageTargets: ['peon', 'grunt'],
    init() {
        // deals double damage in peons and grunts
        game.ee.on('damage', function (evt) {
            if ('attack' !== evt.type) return;
            if ('rogue' !== evt.source.id) return;
            const doubleDamageTargets = data.class.rogue.doubleDamageTargets;
            if (doubleDamageTargets.includes(evt.target.id)) {
                evt.amount *= 2;
            }
        });
        game.ee.on('min_attack_damage', (evt) => {
            if ('rogue' !== evt.source.id) return;
            const doubleDamageTargets = data.class.rogue.doubleDamageTargets;
            if (doubleDamageTargets.includes(evt.target.id)) {
                evt.amount *= 2;
            }
        });
        game.ee.on('max_attack_damage', (evt) => {
            if ('rogue' !== evt.source.id) return;
            const doubleDamageTargets = data.class.rogue.doubleDamageTargets;
            if (doubleDamageTargets.includes(evt.target.id)) {
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
    firstAttackBonus: 5,
    init() {
        // deals more damage on first attack in every combat
        game.ee.on('damage', function (evt) {
            if ('attack' !== evt.type) return;
            if (evt.source.id === 'hunter' && game.player.flags.firstAttack) {
                // debugLog('HUNTER FIRST ATTACK BONUS APPLIED!');
                game.player.flags.firstAttack = false;
                evt.amount += data.class.hunter.firstAttackBonus;
            }
        });
        game.ee.on('min_attack_damage', function (evt) {
            if (evt.source.id === 'hunter' && evt.source.flags.firstAttack) {
                evt.amount += data.class.hunter.firstAttackBonus;
            }
        });
        game.ee.on('max_attack_damage', function (evt) {
            if (evt.source.id === 'hunter' && evt.source.flags.firstAttack) {
                evt.amount += data.class.hunter.firstAttackBonus;
            }
        });
        game.ee.on('combat_start', function (evt) {
            game.player.flags.firstAttack = true;
        });
    },
};

data.class.wizard = {
    name: 'Wizard',
    type: 'class',
    id: 'wizard',
    hitPoints: 18,
    spellsCount: 2,
    damage: {
        bonus: 0,
        fixed: false,
    },
    init() {
        // learns random spells on game init
        game.ee.on('player_created', function (evt) {
            let count = data.class.wizard.spellsCount;
            const playerSpells = evt.player.spellsLearned;
            while (count-- > 0) {
                const spell = getSpell();
                playerSpells[spell.id] = (playerSpells[spell.id] || 0) + 1;
                debugLog('the Wizard player learned', spell.name, 'spell');
            }
        });
    },
};

data.class.monk = {
    name: 'Monk',
    type: 'class',
    id: 'monk',
    hitPoints: 20,
    damage: {
        bonus: 2,
        fixed: false,
    },
    init() {
        // hit 2 creatures at once
        game.ee.on('get_number_of_targets', function (evt) {
            if ('player:attack' !== evt.type) return;
            evt.quantity = 2;
        });
    },
};

data.class.alchemist = {
    name: 'Alchemist',
    type: 'class',
    id: 'alchemist',
    hitPoints: 18,
    damage: {
        bonus: 1,
        fixed: false,
    },
    damageAcid: 8,
    startingPotions: 2,
    init() {
        // start the game with 1 potion
        game.ee.on('player_created', function (evt) {
            evt.player.potions += data.class.alchemist.startingPotions;
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
    hitPoints: 5,
};

data.creature.grunt = {
    name: 'Grunt',
    type: 'creature',
    id: 'grunt',
    damage: {
        bonus: 3,
        fixed: true,
    },
    hitPoints: 11,
};

data.creature.brute = {
    name: 'Brute',
    type: 'creature',
    id: 'brute',
    damage: {
        bonus: 6,
        fixed: true,
    },
    hitPoints: 14,
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
    cast(caster) {
        const enemies = game.scene.enemies;
        const target = getTargets(enemies, 1, 'spell:fireball')[0];
        if (target) dealDamage(8, target, caster, 'spell:fireball');
    },
};

data.spell.lightning = {
    name: 'Lightning',
    type: 'spell',
    id: 'lightning',
    cast(caster) {
        const enemies = game.scene.enemies;
        const targets = getTargets(enemies, 3, 'spell:lightning');
        for (const target of targets) {
            dealDamage(5, target, caster, 'spell:lightning');
        }
    },
};

data.spell.freezingRay = {
    name: 'Freezing Ray',
    type: 'spell',
    id: 'freezingRay',
    cast(caster) {
        const enemies = game.scene.enemies;
        const target = getTargets(enemies, 1, 'spell:freezingRay')[0];
        if (target) {
            const damage = roll() + 2;
            dealDamage(damage, target, caster, 'spell:freezingRay');
            stunUnit(target);
        }
    },
};

data.spell.summonBeast = {
    name: 'Summon Beast',
    type: 'spell',
    id: 'summonBeast',
    cast(caster) {
        // maybe destroy current summoned beast
        const allies = game.scene.allies || [];
        for (const unit of allies) {
            if ('spiritualBeast' === unit.id) {
                expireSummoning(unit);
            }
        }
        const unit = createSummoning(data.summoning.spiritualBeast);
        allies.push(unit);
    },
};

data.spell.heal = {
    name: 'Heal',
    type: 'spell',
    id: 'heal',
    recover: 10,
    cast(caster) {
        recoverHitPoints(caster, data.spell.heal.recover, 'spell:heal');
    },
};

data.spell.lifeDrain = {
    name: 'Life Drain',
    type: 'spell',
    id: 'lifeDrain',
    recover: 5,
    cast(caster) {
        const enemies = game.scene.enemies;
        const target = getTargets(enemies, 1, 'spell:lifeDrain')[0];
        if (target) {
            dealDamage(5, target, caster, 'spell:lifeDrain');
            recoverHitPoints(
                caster,
                data.spell.lifeDrain.recover,
                'spell:lifeDrain'
            );
        }
    },
};

//SUMMONINGS
data.summoning = {};
data.summoning.spiritualBeast = {
    name: 'Spiritual Beast',
    type: 'summoning',
    id: 'spiritualBeast',
    damage: {
        bonus: 0,
        fixed: false,
    },
    hitPoints: 5,
};

// POTION
data.potion = {
    name: 'Potion',
    recover: 15,
};

// TRAP
data.trap = {
    damage: {
        bonus: 2,
        fixed: false,
    },
};
