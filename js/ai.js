function decidePlayerAction() {
    const scene = game.scene;
    const player = game.player;
    const hp = player.hitPoints;
    const enemies = scene.enemies;

    if (player.potions > 0 && hp <= nextEnemiesDamage(enemies)) {
        drinkPotion();
    } else if (
        player.id === 'alchemist' &&
        player.potions > 1 &&
        facingEnemy('brute') &&
        getEnemy('brute').hitPoints >= 9
    ) {
        const target = getEnemy('brute');
        throwAcid(target);
    } else if (
        player.id === 'alchemist' &&
        player.potions > 1 &&
        facingEnemy('boss') &&
        getEnemy('boss').hitPoints >= 2
    ) {
        const target = getEnemy('boss');
        throwAcid(target);
    } else {
        // attack the enemies
        const targets = getTargets(enemies, 1, 'attack');
        for (const target of targets) {
            attackEnemy(target);
        }
    }
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

function attackEnemy(target) {
    game.player.attack(target);
    if (target.dead) {
        game.ee.emit('enemy_dies', { enemy: target });
    }
}

function nextEnemiesDamage(enemies) {
    const playerMinDamage = MinAttackDamage(game.player);
    const nextPlayerTargets = getTargets(enemies, 1, 'attack');
    const eligibleEnemies = arrayClone(enemies);

    eligibleEnemies.filter((e) => !nextPlayerTargets.includes(e) && !e.dead);
    nextPlayerTargets.filter((e) => e.hitPoints > playerMinDamage);
    eligibleEnemies.concat(nextPlayerTargets);

    let totalDamage = 0;
    for (const enemy of eligibleEnemies) {
        totalDamage += MaxAttackDamage(enemy);
    }

    return totalDamage;
}

function MinAttackDamage(source) {
    const amount = source.damage.fixed
        ? source.damage.bonus
        : 1 + source.damage.bonus;
    const eventData = { source, amount };
    game.ee.emit('min_attack_damage', eventData);
    return eventData.amount;
}

function MaxAttackDamage(source) {
    const amount = source.damage.fixed
        ? source.damage.bonus
        : 6 + source.damage.bonus;
    const eventData = { source, amount };
    game.ee.emit('max_attack_damage', eventData);
    return eventData.amount;
}
