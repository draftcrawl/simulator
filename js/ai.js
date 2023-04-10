function decideAllyAction(unit) {
    return attackEnemies(unit, unit.id);
}

function decidePlayerAction() {
    const scene = game.scene;
    const player = game.player;
    const currentHP = player.hitPoints;
    const missingHP = player.hitPointsMax - currentHP;
    const enemies = scene.enemies;
    const nextTarget = getTargets(enemies, 1, 'player:atack')[0];

    // Healing behaviors
    if (player.potions > 0 && currentHP <= nextEnemiesDamage(enemies)) {
        // Drink potion to not die
        return drinkPotion();
    }
    if (hasSpell('heal') && currentHP <= nextEnemiesDamage(enemies)) {
        // Drink potion to not die
        return castSpell('heal');
    } else if (
        player.potions > 0 &&
        1 === countEnemies('peon') &&
        missingHP >= data.potion.recover
    ) {
        // Drink potion when facing only one peon
        return drinkPotion();
    } else if (
        hasSpell('heal') &&
        1 === countEnemies('peon') &&
        missingHP >= data.spell.heal.recover
    ) {
        return castSpell('heal');
    } else if (
        hasSpell('heal') &&
        !facingEnemy('boss', 'brute') &&
        1 === countEnemies() &&
        missingHP >= data.spell.heal.recover
    ) {
        return castSpell('heal');
    }

    if (hasSpell('lightning') && countEnemies('peon') >= 2) {
        return castSpell('lightning');
    }

    if (MinAttackDamage(player, nextTarget) >= nextTarget.hitPoints) {
        return attackEnemies();
    }

    if (
        player.id === 'alchemist' &&
        player.potions > 1 &&
        facingEnemy('brute') &&
        getEnemy('brute').hitPoints >= 3
    ) {
        // Alchemist acid vs brute or boss
        // throw acid in Brutes
        const target = getEnemy('brute');
        return throwAcid(target);
    } else if (
        player.id === 'alchemist' &&
        player.potions > 1 &&
        facingEnemy('boss') &&
        getEnemy('boss').hitPoints >= 3
    ) {
        // always try to throw acid in Boss
        const target = getEnemy('boss');
        return throwAcid(target);
    }

    if (hasSpell('lifeDrain') && missingHP >= data.spell.lifeDrain.recover) {
        return castSpell('lifeDrain');
    }

    if (
        'wizard' !== player.id &&
        !facingEnemy('grunt') &&
        facingEnemy('peon') &&
        countEnemies('peon') === 1
    ) {
        return attackEnemies();
    }

    if (
        hasSpell('summonBeast') &&
        !hasBeast() &&
        (facingEnemy('boss', 'brute') || countEnemies() >= 2)
    ) {
        // think before spend scroll of summon beast
        return castSpell('summonBeast');
    } else if (hasSpell('summonBeast', true) && !hasBeast()) {
        // always cast spell of summon a beast
        return castSpell('summonBeast');
    } else if (player.id === 'hunter' && player.flags.firstAttack) {
        return attackEnemies();
    } else if (hasSpell('freezingRay')) {
        return castSpell('freezingRay');
    } else if (hasSpell('fireball')) {
        return castSpell('fireball');
    } else if (hasSpell('lightning', true)) {
        return castSpell('lightning');
    }

    // attack the enemies
    return attackEnemies();
}

function decideEnemyAction(enemy) {
    const allies = game.scene.allies;
    const targets = getTargets(allies, 1, 'enemy:attack');
    for (const target of targets) {
        enemy.attack(target);
    }
}

function attackEnemies(source = null, type = 'player') {
    source = source || game.player;
    const enemies = game.scene.enemies;
    const targets = getTargets(enemies, 1, `${type}:attack`);
    const attackDamage = getAttackDamage(source);
    for (const target of targets) {
        source.attack(target, attackDamage);
    }
}

function hasBeast() {
    const allies = game.scene.allies || [];
    for (const unit of allies) {
        if (unit.id === 'spiritualBeast' && !unit.dead) {
            return true;
        }
    }
    return false;
}

function facingEnemy(...ids) {
    const enemies = game.scene.enemies;
    if (!enemies) return false;
    for (const id of ids) {
        for (const enemy of enemies) {
            if (enemy.dead) continue;
            if (enemy.id === id) return true;
        }
    }
    return false;
}

function countEnemies(id = 'all') {
    const enemies = game.scene.enemies;
    if (!enemies) return 0;
    let total = 0;
    for (const enemy of enemies) {
        if (enemy.dead) continue;
        if ('all' === id || enemy.id === id) total++;
    }
    return total;
}

function nextEnemiesDamage(enemies) {
    const nextPlayerTargets = getTargets(enemies, 1, 'player:attack');
    const eligibleEnemies = unitGroupAlive(arrayClone(enemies));

    eligibleEnemies.filter((e) => !nextPlayerTargets.includes(e));
    nextPlayerTargets.filter(
        (e) => e.hitPoints > MinAttackDamage(game.player, e)
    );
    eligibleEnemies.concat(nextPlayerTargets);

    let totalDamage = 0;
    for (const enemy of eligibleEnemies) {
        totalDamage += MaxAttackDamage(enemy, game.player);
    }

    return totalDamage;
}

function MinAttackDamage(source, target = null) {
    const amount = source.damage.fixed
        ? source.damage.bonus
        : 1 + source.damage.bonus;
    const eventData = {
        source,
        target,
        amount,
    };
    game.ee.emit('min_attack_damage', eventData);
    return eventData.amount;
}

function MaxAttackDamage(source, target = null) {
    const amount = source.damage.fixed
        ? source.damage.bonus
        : 6 + source.damage.bonus;
    const eventData = {
        source,
        target,
        amount,
    };
    game.ee.emit('max_attack_damage', eventData);
    return eventData.amount;
}
