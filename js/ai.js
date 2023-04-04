function decidePlayerAction() {
    const scene = game.scene;
    const player = game.player;
    const hp = player.hitPoints;
    const max = player.hitPointsMax;

    if (
        scene.type === 'event' &&
        scene.findPotion &&
        max - hp <= data.potion.heal
    ) {
        // if the player find a potion, check if they are low HP
        return drinkPotion();
        alert(1);
    } else if (
        scene.type === 'combat' &&
        player.potions > 0 &&
        hp <= nextEnemiesDamage(scene.enemies)
    ) {
        return drinkPotion();
        alert(2);
    } else {
        // attack the enemies
        const targets = getTargets(scene.enemies, 1, 'attack');
        for (const target of targets) {
            attackEnemy(target);
        }
    }
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
