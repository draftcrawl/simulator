function attack(source, target) {
    const amount = source.damage.bonus + (source.damage.fixed ? 0 : roll());
    return dealDamage(amount, target, source, 'attack');
}

function getTargets(group, quantity = 1) {
    const alive = group.filter((obj) => !obj.dead);
    const ordered = alive.sort((a, b) => a.hitPoints - b.hitPoints);
    return ordered.slice(0, quantity);
}
