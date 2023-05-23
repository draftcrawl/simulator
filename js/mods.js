// turbo mode
function setupMods(mods) {
    game.ee.on('game_init', () => {
        if (!mods.includes('turbo')) return;
        const creatureDamageBonus = 1;
        const bossDamageBonus = 2;
        data.creature.peon.damage.bonus += creatureDamageBonus;
        data.creature.grunt.damage.bonus += creatureDamageBonus;
        data.creature.brute.damage.bonus += creatureDamageBonus;
        data.boss.damage.bonus += bossDamageBonus;
    });
}
