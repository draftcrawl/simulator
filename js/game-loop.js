function createGame(args) {
    const game = {
        sceneCount: null,
        dungeonSize: null,
        player: null,
        ee: null, // ee = event emitter
        scene: null,
        init() {
            global.game = this;
            args = this.args = this.parseArgs(args);
            this.rng = new RNG().setSeed(checkSeed(args.seed));

            this.ee = createNanoEvents();
            this.globalEvents();

            this.player = createPlayer(args.playerClass);
            this.dungeonSize = data.dungeonSize();
            this.sceneCount = 1;

            global.data = getData();

            if (args.beforeInit) args.beforeInit(this);
            this.ee.emit('game_init');

            this.run();
        },
        async run() {
            this.ee.emit('run_start');

            while (this.sceneCount <= this.dungeonSize) {
                game.scene = {};

                await createScene(null, {
                    number: this.sceneCount,
                });

                if (this.player.dead) break;

                this.sceneCount++;
            }

            if (!this.player.dead) {
                await createScene('combat', {
                    number: this.dungeonSize + 1,
                    boss: true,
                });
            }

            if (!this.player.dead) {
                this.ee.emit('victory');
            }
        },
        globalEvents() {
            this.ee.on('combat_start', () => {
                // reset the spells cast
                game.player.spellsCast = {};
            });
            this.ee.on('combat_round_end', () => {
                const enemies = game.scene.enemies || [];
                for (const enemy of enemies) {
                    delete enemy.flags.stunned;
                }
            });
            this.ee.on('scene_end', () => {
                const allies = game.scene.allies || [];
                for (const unit of allies) {
                    if ('summoning' === unit.type) {
                        expireSummoning(unit);
                    }
                }
            });
            this.ee.on('player_created', (evt) => {
                if (game.args.gm) {
                    evt.player.hitPoints = evt.player.hitPoints * 3;
                    evt.player.damage.bonus = evt.player.damage.bonus * 3;
                    evt.player.hitPointsMax = evt.player.hitPoints;
                    evt.player.potions = 5;
                    evt.player.scrolls.fireball = 5;
                    evt.player.scrolls.freezingRay = 5;
                    evt.player.scrolls.heal = 5;
                    evt.player.scrolls.lightning = 5;
                    evt.player.scrolls.lifeDrain = 5;
                    evt.player.scrolls.summonBeast = 5;
                }
            });
        },
        parseArgs(args) {
            args.seed = args.seed ? parseInt(args.seed, 10) : Date.now();
            args.debug = !!args.debug;
            args.gm = !!args.gm;
            args.actionInterval = parseInt(args.actionInterval, 10) | 0;
            args.beforeInit = isFunction(args.beforeInit);
            args.mods = (args.mods || []).map((val) => (val || '').trim());
            return args;
        },
    };

    game.init();

    return game;
}
