function attack(source, target) {
    const amount = source.damage.bonus + (source.damage.fixed ? 0 : roll());
    return dealDamage(amount, target, source, 'attack');
}

function getTargets(group, quantity = 1, type = null) {
    const alive = group.filter((obj) => !obj.dead);
    const ordered = alive.sort((a, b) => a.hitPoints - b.hitPoints);
    const eventData = { quantity, type };
    game.ee.emit('get_number_of_targets', eventData);
    return ordered.slice(0, eventData.quantity);
}

function drinkPotion() {
    if (game.player.potions <= 0) return;
    game.player.potions--;
    recoverHitPoints(game.player, data.item.potion.heal, 'potion');
}

// read a scroll first if possible
// if not, cast the spell
function castSpell(id) {
    const spell = getSpell(id);
    if (!hasSpell(id)) {
        throw new Error('Not found spell or scroll of ' + spell.name);
    }
}

function throwAcid(target) {
    // only alchemists
    if ('alchemist' !== game.player.id) return;
    const damage = roll() + 10;
    player.potions--;
    return dealDamage(damage, target, game.player, 'alchemist_acid');
}
