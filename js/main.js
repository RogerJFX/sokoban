$sok = window.$sok || {};
(function Main(self) {

    const GROUND = 0;
    const WALL = 1;
    const TARGET = 2;

    let settings;
    let classMap;
    let fields = [];

    let fillBoardUiFn;
    let createNodeUiFn;
    let createMarioFn;
    let createCrateFn;

    function Field(x, y, _type) {
        const me = this;
        this.type = _type;
        let myNode;
        let hasCrate = false;

        this.createNode = createNode;
        this.getNode = () => {return myNode};
        this.setHasCrate = (has) => {
            hasCrate = has;
        };
        this.getHasCrate = () => {
            return hasCrate;
        };
        function createNode() {
            const element = createNodeUiFn((() => {
                switch (me.type) {
                    case GROUND:
                        return classMap.ground;
                    case WALL:
                        return classMap.wall;
                }
            })());
            myNode = element;
            return element;
        }
    }

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

    self.marioMightWalk = (recentCoords, dir) => {
        let targetField;
        switch (dir) {
            case $sok.constants.LEFT:
                targetField = fields[recentCoords.y][recentCoords.x - 1];
                console.log(targetField.getHasCrate());
                return targetField.type === GROUND;
            case $sok.constants.UP:
                targetField = fields[recentCoords.y - 1][recentCoords.x];
                console.log(targetField.getHasCrate());
                return targetField.type === GROUND;
            case $sok.constants.RIGHT:
                targetField = fields[recentCoords.y][recentCoords.x + 1];
                console.log(targetField.getHasCrate());
                return targetField.type === GROUND;
            case $sok.constants.DOWN:
                targetField = fields[recentCoords.y + 1][recentCoords.x];
                console.log(targetField.getHasCrate());
                return targetField.type === GROUND;
            default:
                return false;
        }
    };

    function iterate(fn) {
        let i, j;
        for(i = 0; i < settings.rows; i++) {
            for(j = 0; j < settings.cols; j++) {
                fn(i, j);
            }
        }
    }

    function createFields() {
        fields = [];
        for(let i = 0; i < settings.rows; i++) {
            fields[i] = [];
        }
        iterate((i, j) => {
            if(i === 0 || j === 0 || i === settings.rows - 1 || j === settings.cols - 1) {
                fields[i][j] = new Field(i, j, WALL);
            } else {
                fields[i][j] = new Field(i, j, GROUND);
            }
        });
    }

    function initGame(_settings) {
        if(_settings) {
            const a = JSON.parse(_settings);
            settings = {cols:a[0], rows:a[1], numMines:a[2], fieldsToOpen: a[0] * a[1] - a[2]};
        }
        createFields();
        fillBoardUiFn(fields);
        createMarioFn(fields[2][4].getNode());
        createCrateFn(fields[2][3].getNode());
        fields[2][3].setHasCrate(true);
    }
})($sok.main = $sok.main || {});