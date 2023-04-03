function attack(source, target) {
    const amount = source.damage.bonus + (source.damage.fixed ? 0 : roll());
    return dealDamage(amount, target, source, 'attack');
}
