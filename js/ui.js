function browserUI(game) {
    game.ee.on('run_start', () => {
        loggerReset();

        logger('<b>==== Game Started ====</b>');
        logger(`Seed: ${game.args.seed}`);
        logger(`Dungeon Size: ${game.dungeonSize}`);
        logger(`Class: ${game.player.name}`);
        logger(`Special: ${game.player.special()}`);
        logger(`HP: ${game.player.hitPointsMax}`);
        logger(`Attack: 1d6+${game.player.damage.bonus}`);
        if (Object.keys(game.player.spellsLearned).length > 0) {
            logger(`Spells: ${getPlayerSpellsName() || '-'}`);
        }
        game.args.gm && logger(`GM Enabled: Yes`);
    });

    game.ee.on('scene_start', (evt) => {
        if (evt.type === 'combat' && evt.boss) {
            logger(`<b>=== Final Scene (${evt.type}) ===</b>`);
        } else {
            logger(
                `<b>=== Scene ${evt.number}/${game.dungeonSize} (${evt.type}) ===</b>`
            );
        }
    });

    game.ee.on('game_over', () => {
        logger('=== Game Over ===');
        logger(`<b red>You lose!</b>`);
        displayActionButtons();
    });

    game.ee.on('victory', () => {
        logger('=== VICTORY ===');
        logger(`<b green>You win!</b>`);
        displayActionButtons();
    });

    game.ee.on('combat_start', (evt) => {
        logger(
            `${game.player.name}
            (HP: ${getHitPointsText(game.player)}) vs
            ${getCreatureGroupName(evt.enemies)}`
        );
    });

    game.ee.on('combat_round_start', (evt) => {
        logger(`<u>ROUND ${evt.number}</u>`);
    });

    game.ee.on('unit_cant_attack', ({ unit }) => {
        if (unit.flags.stunned) {
            logger(
                `<i>${unit.name} (HP: ${getHitPointsText(unit)})
                is stunned and cannot attack this round.</i>`
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
            `<i>${evt.target.name} stepped on a trap and took ${evt.amount} damage.</i>`
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
        if (unit.type !== 'summoning') {
            logger(`The ${unit.name} died.`);
        } else {
            logger(`The summoned ${unit.name} was destroyed.`);
        }
    });

    game.ee.on('summoning_expired', ({ unit }) => {
        logger(`<i>The summoned ${unit.name} has expired.</i>`);
    });

    game.ee.on('spell_cast', ({ spell, caster, from }) => {
        if ('spells' === from) {
            logger(
                `<i>${caster.name} (HP: ${getHitPointsText(caster)})
                is casting ${spell.name}...</i>`
            );
        } else {
            logger(
                `<i>${caster.name} (HP: ${getHitPointsText(caster)})
                is reading a scroll of ${spell.name}...</i>`
            );
            logger(
                `${caster.name} now has
                ${caster.scrolls[spell.id]} Scroll of ${spell.name}.`
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
            `<i>${game.player.name} (HP: ${getHitPointsText(game.player)})
            find 1 ${evt.name}.</i>`
        );
        if ('potion' === evt.type) {
            logger(
                `${game.player.name} now has ${game.player.potions} potions.`
            );
        } else if ('scroll' === evt.type) {
            logger(
                `${game.player.name} now has
                ${game.player.scrolls[evt.id]} ${evt.name}.`
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
                `${evt.target.name} (HP: ${getHitPointsText(oldHitPoints)})
                drank a potion.`
            );
            logger(`${evt.target.name} (HP: ${getHitPointsText(evt.target)})
            now has ${evt.target.potions} potions.`);
        }
        logger(`${evt.target.name} restored ${evt.amount} HP.`);
    });
}

const loggerRoot = document.querySelector('#logger');
const loggerMessages = loggerRoot.querySelector('#logger-content');
const loggerActions = loggerRoot.querySelector('#logger-actions');
function logger(msg) {
    const el = document.createElement('p');
    el.innerHTML = msg;
    loggerMessages.appendChild(el);
    document.documentElement.scrollTop = 9999999;
}

function loggerReset() {
    loggerMessages.innerHTML = '';
    loggerRoot.style.display = 'block';
    loggerActions.style.display = 'none';
    loggerActions.className = '';
}

function displayActionButtons(reset = true, retry = true, backToTop = true) {
    const url = new URL(location.href);
    loggerActions.className = '';

    if (retry) {
        url.searchParams.set('class', game.player.id);
        url.searchParams.set('seed', game.args.seed);
        window.urlReplay = url.href;

        url.searchParams.set('seed', '');
        window.urlRetry = url.href;
        loggerActions.classList.add('retry');
    }

    if (reset) {
        loggerActions.classList.add('reset');
    }

    if (backToTop) {
        loggerActions.classList.add('back-to-top');
    }

    loggerActions.style.display = 'block';
    document.documentElement.scrollTop = 9999999;
}
