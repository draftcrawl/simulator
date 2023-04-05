function attack(source, target, damage = null) {
    const amount = damage ? damage : getAttackDamage(source);
    return dealDamage(amount, target, source, 'attack');
}

function getTargets(unitGroup, quantity = 1, type = null, order = 'ASC') {
    const alive = unitGroupAlive(unitGroup);
    let eventData = { order, type };
    game.ee.emit('get_targets_order', eventData);
    const compare =
        'ASC' === eventData.order
            ? (a, b) => a.hitPoints - b.hitPoints
            : (a, b) => b.hitPoints - a.hitPoints;
    const ordered = alive.sort(compare);

    eventData = { quantity, type };
    game.ee.emit('get_number_of_targets', eventData);
    quantity = eventData.quantity;

    return ordered.slice(0, quantity);
}

function getEnemy(id) {
    const enemies = game.scene.enemies.filter((unit) => unit.id === id);
    const alive = unitGroupAlive(enemies);
    const compare = (a, b) => a.hitPoints - b.hitPoints;
    const ordered = alive.sort(compare);
    return ordered.slice(0, 1).pop();
}

function drinkPotion() {
    if (game.player.potions <= 0)
        throw new Error('Player does not have potions');
    game.player.potions--;
    recoverHitPoints(game.player, data.potion.recover, 'potion');
}

// read a scroll first if possible
// if not, cast the spell
function castSpell(id, onlyLearned = false) {
    const spell = getSpell(id);
    const player = game.player;
    let from = 'spells';

    if (hasSpell(id, true)) {
        // cast learned spell
        player.spellsCast[id] = (player.spellsCast[id] || 0) + 1;
        game.ee.emit('spell_cast', { spell, caster: player, from });
        return spell.cast(player);
    }

    if (!onlyLearned && hasSpell(id)) {
        // cast magic scroll
        player.scrolls[id] = Math.max(--player.scrolls[id], 0);
        from = 'scrolls';
        game.ee.emit('spell_cast', { spell, caster: player, from });
        return spell.cast(player);
    }

    throw new Error('Player does not have spell or scroll of ' + spell.name);
}

function throwAcid(target) {
    // only alchemists
    if ('alchemist' !== game.player.id) return;

    if (game.player.potions <= 0)
        throw new Error('Player does not have potions');

    game.player.potions--;
    const damage = roll() + data.class.alchemist.damageAcid;

    game.ee.emit('alchemist_acid', { source: game.player, target });
    return dealDamage(damage, target, game.player, 'alchemist:acid');
}
