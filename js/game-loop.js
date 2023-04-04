function createGame(args) {
    const game = {
        sceneCount: null,
        dungeonSize: null,
        player: null,
        ee: null, // ee = event emitter
        init() {
            global.game = this;
            args = this.args = this.parseArgs(args);

            this.ee = createNanoEvents();
            this.player = createPlayer(args.playerClass);
            this.dungeonSize = roll() + 9;
            this.sceneCount = 1;

            if (args.beforeInit) args.beforeInit(this);
            this.ee.emit('game_init');

            this.run();
        },
        async run() {
            this.ee.emit('run_start');

            while (this.sceneCount <= this.dungeonSize) {
                await createScene(null, {
                    number: this.sceneCount,
                });

                if (this.player.dead) {
                    this.ee.emit('game_over');
                    break;
                }

                this.sceneCount++;
            }
        },
        parseArgs(args) {
            args.debug = !!args.debug;
            args.actionInterval = parseInt(args.actionInterval, 10) | 0;
            args.beforeInit = isFunction(args.beforeInit);
            return args;
        },
    };

    game.init();

    return game;
}
