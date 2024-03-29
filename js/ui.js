$sok = window.$sok || {};

(function Ui(self) {

    Element.prototype.addClass = Element.prototype.addClass || function (clazz) {
        const existing = this.getAttribute('class');
        this.setAttribute('class', existing ? existing + ' ' + clazz : clazz);
        return this;
    };

    Element.prototype.removeClass = Element.prototype.removeClass || function (clazz) {
        this.setAttribute('class',
            this.getAttribute('class').split(' ').filter(item => item !== clazz).join(' ')
        );
        return this;
    };

    Element.prototype.hasClass = Element.prototype.hasClass || function (clazz) {
        return this.getAttribute('class').split(' ').find(item => item === clazz) === clazz;
    };

    const classMap = $sok.constants.classMap;
    const marioWalkSequences = $sok.constants.marioWalkSequences;

    let controller;
    let stage;
    let moveStage;
    let mario;
    let walking = false;

    function fillBoard (fields) {
        stage.innerHTML = '';
        let i, j;
        for (i = 0; i < fields.length; i++) {
            const row = document.createElement('DIV');
            row.addClass(classMap.row);
            for(j = 0; j < fields[i].length; j++) {
                row.appendChild(fields[i][j].createNode());
            }
            stage.appendChild(row);
        }
    }

    function createNode (clazz) {
        const element = document.createElement('DIV');
        element.addClass(classMap.field).addClass(clazz);
        stage.appendChild(element);
        return element;
    }

    function createMario(field) {
        const element = document.createElement('DIV');
        element.addClass(classMap.mario);
        element.style.top = field.offsetTop + "px";
        element.style.left = field.offsetLeft + "px";
        moveStage.appendChild(element);
        mario = element;
        return element;
    }

    function createCrate(field) {
        const element = document.createElement('DIV');
        element.addClass(classMap.crate);
        element.style.top = field.offsetTop + "px";
        element.style.left = field.offsetLeft + "px";
        moveStage.appendChild(element);
        return element;
    }

    function walk(dir, crate) {
        if(walking) {
            return;
        }
        let animationInterval;
        const storedOffsetLeft = mario.offsetLeft;
        const storedOffsetTop = mario.offsetTop;
        walking = true;
        let walkSeq;
        let seqCounter = 0;
        let counter = 0;
        switch(dir) {
            case $sok.constants.LEFT:
                walkSeq = marioWalkSequences.LEFT;
                walk(-1, "offsetLeft", "left", storedOffsetLeft);
                break;
            case $sok.constants.UP:
                walkSeq = marioWalkSequences.UP;
                walk(-1, "offsetTop", "top", storedOffsetTop);
                break;
            case $sok.constants.RIGHT:
                walkSeq = marioWalkSequences.RIGHT;
                walk(1, "offsetLeft", "left", storedOffsetLeft);
                break;
            case $sok.constants.DOWN:
                walkSeq = marioWalkSequences.DOWN;
                walk(1, "offsetTop", "top", storedOffsetTop);
                break;
        }
        function incSeqCounter(counter) {
            if(++counter >= walkSeq.length) {
                counter = 0;
            }
            return counter;
        }
        function walk(f, property, styleProperty, storedProperty) {
            animationInterval = setInterval(() => {
                mario.style[styleProperty] = (mario[property] + 3 * f) + "px";
                if(crate) {
                    crate.style[styleProperty] = (crate[property] + 3 * f) + "px";
                }
                if(counter++ % 3 === 0) {
                    seqCounter = incSeqCounter(seqCounter);
                    mario.style.backgroundPosition = (-walkSeq[seqCounter] * $sok.constants.TILE_SIZE) + "px";
                }
                if((f === 1 && mario[property] - storedProperty > $sok.constants.TILE_SIZE)
                    || (f === -1 && storedProperty - mario[property] > $sok.constants.TILE_SIZE)) {
                    clearInterval(animationInterval);
                    mario.style[styleProperty] = (storedProperty + $sok.constants.TILE_SIZE * f) + "px";
                    if(crate) {
                        crate.style[styleProperty] = (storedProperty + $sok.constants.TILE_SIZE * 2 * f) + "px";
                    }

                    walking = false;
                    controller.checkDone();
                    queueWalk();
                }
            }, 30);
        }
    }

    function stopMario() {
        mario.style.backgroundPosition = -10 * $sok.constants.TILE_SIZE + "px";
    }

    const walkingQueue = [];

    function nextEvent(evt) {
        const code = evt.keyCode;
        switch(code) {
            case $sok.constants.LEFT:
            case $sok.constants.UP:
            case $sok.constants.RIGHT:
            case $sok.constants.DOWN:
                const x =  mario.offsetLeft / $sok.constants.TILE_SIZE;
                const y =  mario.offsetTop / $sok.constants.TILE_SIZE;
                // Yes, we've got an animation.
                if(x % 1 === 0 && y % 1 === 0) {
                    const response = controller.marioMightWalk({x: x, y: y}, code);
                    if(response.granted) {
                        walk(code, response.crate);
                    } else {
                        walkingQueue.length = 0;
                        stopMario();
                    }
                }
                break;
        }
    }

    function queueWalk() {
        if(walkingQueue.length !== 0) {
            nextEvent(walkingQueue.shift());
        } else {
            stopMario();
        }
    }

    function clearStates() {
        stage.innerHTML = "";
        moveStage.innerHTML = "";
    }


    self.init = (_stage, _moveStage, _controller) => {
        stage = _stage;
        moveStage = _moveStage;
        controller = _controller;
        controller.injectFillBoardUiFn(fillBoard)
            .injectCreateNodeFn(createNode)
            .injectCreateMario(createMario)
            .injectCreateCrate(createCrate)
            .injectUiInit(clearStates)
            .injectClassMap(classMap);
        document.onkeyup = (evt) => {
            if(walking || walkingQueue.length !== 0) {
                walkingQueue.push(evt);
            } else {
                nextEvent(evt);
            }
        };
    };

})($sok.ui = $sok.ui || {});
