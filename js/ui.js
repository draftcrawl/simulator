function browserUI(game) {
    game.ee.on('run_start', () => {
        loggerReset();

        logger('==== Game Started ====');
        logger(`Seed: ${game.args.seed}`);
        logger(`Dungeon Size: ${game.dungeonSize}`);
        logger(`Class: ${game.player.name}`);
        if (Object.keys(game.player.spellsLearned)) {
            logger(`Spells: ${getPlayerSpellsName()}`);
        }
        logger(`HP: ${game.player.hitPointsMax}`);
        logger(`Attack: 1d6+${game.player.damage.bonus}`);
        game.args.gm && logger(`GM Enabled: Yes`);
    });

    game.ee.on('scene_start', (evt) => {
        if (evt.type === 'combat' && evt.boss) {
            logger(`=== Final Scene (${evt.type}) ===`);
        } else {
            logger(
                `=== Scene ${evt.number}/${game.dungeonSize} (${evt.type}) ===`
            );
        }
    });

    game.ee.on('game_over', () => {
        logger('=== Game Over ===');
        logger(`You lose!`);
        displayActionButtons();
    });

    game.ee.on('victory', () => {
        logger('=== VICTORY ===');
        logger(`You win!`);
        displayActionButtons();
    });

    game.ee.on('combat_start', (evt) => {
        logger(`${game.player.name} vs ${getCreatureGroupName(evt.enemies)}`);
    });

    game.ee.on('combat_round_start', (evt) => {
        logger(`> Round ${evt.number}`);
    });

    game.ee.on('unit_cant_attack', ({ unit }) => {
        if (unit.flags.stunned) {
            logger(
                `${unit.name} (HP: ${getHitPointsText(unit)})
                is stunned and cannot attack this round.`
            );
            return;
        }
    });

    game.ee.on('damaged', (evt) => {
        if ('attack' !== evt.type) return;
        logger(
            `${evt.source.name} (HP: ${getHitPointsText(evt.source)})
            attacks
            ${evt.target.name} (HP: ${getHitPointsText(evt.target)})
            and deals ${evt.amount} damage.`
        );
    });

    game.ee.on('damaged', (evt) => {
        if ('trap' !== evt.type) return;
        logger(
            `${evt.target.name} stepped on a trap and took ${evt.amount} damage.`
        );
    });

    game.ee.on('damaged', (evt) => {
        if ('alchemist:acid' !== evt.type) return;
        logger(`${evt.source.name} spend a potion to throw acid at
        ${evt.target.name} (HP: ${getHitPointsText(evt.target)}) and deals
        ${evt.amount} damage.`);
        logger(`${game.player.name} now has ${game.player.potions} potions.`);
    });

    game.ee.on('unit_dies', ({ unit }) => {
        logger(`The ${unit.name} dies.`);
    });

    game.ee.on('spell_cast', ({ spell, caster, from }) => {
        if ('spells' === from) {
            logger(
                `${caster.name} (HP: ${getHitPointsText(caster)})
                is casting ${spell.name}...`
            );
        } else {
            logger(
                `${caster.name} (HP: ${getHitPointsText(caster)})
                is reading a scroll of ${spell.name}...`
            );
        }
    });

    game.ee.on('damaged', (evt) => {
        if (!evt.type.includes('spell:')) return;
        logger(`The spell deals ${evt.amount} damage to
        ${evt.target.name} (HP: ${getHitPointsText(evt.target)}) .`);
    });

    game.ee.on('find_item', (evt) => {
        logger(
            `${game.player.name} (${getHitPointsText(game.player)})
            find 1 ${evt.item}.`
        );
        if ('potion' === evt.item) {
            logger(
                `${game.player.name} now has ${game.player.potions} potions.`
            );
        }
    });

    game.ee.on('recover_hit_points', (evt) => {
        if ('potion' === evt.type) {
            oldHitPoints = {
                hitPoints: evt.target.hitPoints - evt.amount,
                hitPointsMax: evt.target.hitPointsMax,
            };
            logger(
                `${evt.target.name} (${getHitPointsText(oldHitPoints)})
                drank a potion.`
            );
            logger(`${evt.target.name} (${getHitPointsText(evt.target)})
            now has ${evt.target.potions} potions.`);
        }
        logger(`${evt.target.name} restored ${evt.amount} HP.`);
    });
}

const loggerRoot = document.querySelector('#logger');
const loggerMessages = loggerRoot.querySelector('.content');
const loggerActions = loggerRoot.querySelector('.actions');
function logger(msg) {
    const el = document.createElement('p');
    el.textContent = msg;
    loggerMessages.appendChild(el);
    document.documentElement.scrollTop = 9999999;
}

function loggerReset() {
    loggerMessages.innerHTML = '';
    loggerActions.style.display = 'none';
}

function displayActionButtons() {
    const url = new URL(location.href);

    url.searchParams.set('seed', game.args.seed);
    window.urlSameSeed = url.href;

    url.searchParams.set('seed', '');
    window.urlRandomSeed = url.href;

    loggerActions.style.display = 'block';
    document.documentElement.scrollTop = 9999999;
}

function updateUrlParameter(url, param, value) {
    var regex = new RegExp('(' + param + '=)[^&]+');
    return url.replace(regex, '$1' + value);
}
