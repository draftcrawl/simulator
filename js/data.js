global.data = {};

// CLASSES
data.class = {};

data.class.swordman = {
    name: 'Swordman',
    type: 'class',
    id: 'swordman',
    hitPoints: 30,
    damage: {
        bonus: 1,
        fixed: false,
    },
    init() {
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
    init() {
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
    init() {
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
    init() {
        // learns 2 random spells on game init
        game.ee.on('player_created', function (evt) {
            let count = 2;
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
    hitPoints: 22,
    damage: {
        bonus: 1,
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
    hitPoints: 20,
    damage: {
        bonus: 1,
        fixed: false,
    },
    damageAcid: 10,
    init() {
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
            dealDamage(4, target, caster, 'spell:lightning');
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

data.spell.lifeSteal = {
    name: 'Life Steal',
    type: 'spell',
    id: 'lifeSteal',
    recover: 5,
    cast(caster) {
        const enemies = game.scene.enemies;
        const target = getTargets(enemies, 1, 'spell:lifeSteal')[0];
        if (target) {
            dealDamage(5, target, caster, 'spell:lifeSteal');
            recoverHitPoints(
                caster,
                data.spell.lifeSteal.recover,
                'spell:lifeSteal'
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
    recover: 15,
};

// TRAP
data.trap = {
    damage: {
        bonus: 4,
        fixed: false,
    },
};
