$sok = window.$sok || {};
(function Constants(self) {

    self.TILE_SIZE = 64;
    self.LEFT = 37;
    self.UP = 38;
    self.RIGHT = 39;
    self.DOWN = 40;

    const marioWalkSequences = {
        UP: [1, 2, 1, 3],
        DOWN: [10, 0, 10, 11],
        RIGHT: [4, 5, 4, 6],
        LEFT: [7, 8, 7, 9]
    };

    self.classMap = {
        ground: "ground",
        wall: "wall",
        crate: "crate",
        row: "row",
        spot: "spot",
        field: "field",
        mario: "mario",
        correct: "correct"
    };

    self.marioWalkSequences = marioWalkSequences;

})($sok.constants = $sok.constants || {});