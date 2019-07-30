$sok = window.$sok || {};
(function Main(self) {

    const GROUND = 0;
    const WALL = 1;
    const SPOT = 2;
    const NONE = 4;

    let classMap;
    let fields = [];

    let game;
    let solved = false;
    let moved = 0;

    let fillBoardUiFn;
    let createNodeUiFn;
    let createMarioFn;
    let createCrateFn;
    let initUiFn;

    let countFn;

    function Field(x, y, _type) {
        const me = this;
        this.type = _type;
        let myNode;
        let crate = null;

        this.createNode = createNode;
        this.getNode = () => {return myNode};
        this.setCrate = (_crate) => {
            crate = _crate;
        };
        this.getCrate = () => {
            return crate;
        };
        this.detectCorrectCrate = () => {
            if(crate !== null ) {
                if(me.type === SPOT && !crate.hasClass(classMap.correct)) {
                    crate.addClass(classMap.correct);
                } else if(me.type !== SPOT) {
                    crate.removeClass(classMap.correct);
                }
            }
        };
        function createNode() {
            const element = createNodeUiFn((() => {
                switch (me.type) {
                    case GROUND:
                        return classMap.ground;
                    case WALL:
                        return classMap.wall;
                    case SPOT:
                        return classMap.spot;
                    case NONE:
                        return "nothing";
                }
            })());
            myNode = element;
            return element;
        }
    }

    self.subscribeMoveCount = (fn) => {
        countFn = fn;
        return self;
    };

    self.injectFillBoardUiFn = (fn) => {
        fillBoardUiFn = fn;
        return self;
    };

    self.injectCreateNodeFn = (fn) => {
        createNodeUiFn = fn;
        return self;
    };

    self.injectCreateMario = (fn) => {
        createMarioFn = fn;
        return self;
    };

    self.injectCreateCrate = (fn) => {
        createCrateFn = fn;
        return self;
    };

    self.injectClassMap = (map) => {
        classMap = map;
        return self;
    };

    self.notifyLoaded = (_settings) => {
        initGame(_settings);
    };

    self.injectUiInit = (fn) => {
        initUiFn = fn;
        return self;
    };

    self.marioMightWalk = (recentCoords, dir) => {
        if(solved) {
            return false;
        }
        let targetField;
        let crateToCarry;
        let blocked = false;
        switch (dir) {
            case $sok.constants.LEFT:
                targetField = fields[recentCoords.y][recentCoords.x - 1];
                crateToCarry = targetField.getCrate();
                if (crateToCarry) {
                    blocked = !swapCratesIfGranted(crateToCarry, targetField, fields[recentCoords.y][recentCoords.x - 2]);
                }
                break;
            case $sok.constants.UP:
                targetField = fields[recentCoords.y - 1][recentCoords.x];
                crateToCarry = targetField.getCrate();
                if (crateToCarry) {
                    blocked = !swapCratesIfGranted(crateToCarry, targetField, fields[recentCoords.y - 2][recentCoords.x]);
                }
                break;
            case $sok.constants.RIGHT:
                targetField = fields[recentCoords.y][recentCoords.x + 1];
                crateToCarry = targetField.getCrate();
                if (crateToCarry) {
                    blocked = !swapCratesIfGranted(crateToCarry, targetField, fields[recentCoords.y][recentCoords.x + 2]);
                }
                break;
            case $sok.constants.DOWN:
                targetField = fields[recentCoords.y + 1][recentCoords.x];
                crateToCarry = targetField.getCrate();
                if (crateToCarry) {
                    blocked = !swapCratesIfGranted(crateToCarry, targetField, fields[recentCoords.y + 2][recentCoords.x]);
                }
                break;
        }
        return {granted: targetFieldFree(targetField) && !blocked, crate: crateToCarry};
    };

    self.checkDone = () => {
        countFn(++moved);
        let done = true;
        iterate((i, j) => {
            fields[i][j].detectCorrectCrate();
            if (fields[i][j].type === SPOT && !fields[i][j].getCrate()) {
                done = false;
            }
        });
        if (done) {
            solved = done;
            console.log("YAHOO");
        }
        return done;
    };

    self.retryGame = () => {
        initGame(true);
    };
    self.newGame = () => {
        initGame(false);
    };

    function targetFieldFree(targetField) {
        return targetField.type === GROUND || targetField.type === SPOT;
    }

    function swapCratesIfGranted(crateToCarry, targetField, crateTargetField) {
        if(!targetFieldFree(crateTargetField) || crateTargetField.getCrate() !== null) {
            return false;
        }
        targetField.setCrate(null);
        crateTargetField.setCrate(crateToCarry);
        return true;
    }

    function iterate(fn) {
        let i, j;
        for(i = 0; i < game.board.length; i++) {
            for(j = 0; j < game.board[i].length; j++) {
                fn(i, j);
            }
        }
    }

    function createFields(game) {
        fields = [];
        for(let i = 0; i < game.board.length; i++) {
            fields[i] = [];
        }
        game.spots.forEach(coord => {
            fields[coord[0]][coord[1]] = new Field(coord[0],coord[1], SPOT);
        });

        iterate((i, j) => {
            if(!fields[i][j]){
                fields[i][j] = new Field(i, j, game.board[i][j]);
            }
        });
    }

    function initGame(retry) {
        game = retry ? $sok.gameCreator.retryGame() : $sok.gameCreator.createGame();
        createFields(game);
        initUiFn();
        fillBoardUiFn(fields);
        createMarioFn(fields[game.mario[0]][game.mario[1]].getNode());
        game.crates.forEach(c => {
            fields[[c[0]]][c[1]].setCrate(createCrateFn(fields[c[0]][c[1]].getNode()));
        });
        iterate((i, j) => {
            fields[i][j].detectCorrectCrate();
        });
        moved = 0;
        countFn(moved);
    }

})($sok.main = $sok.main || {});