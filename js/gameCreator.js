$sok = window.$sok || {};
// Should become dynamical.
(function GameCreator(self) {
    const game = {
        board: [
            [4,4,1,1,1,1,1,4],
            [1,1,1,0,0,0,1,4],
            [1,0,0,0,0,0,1,4],
            [1,1,1,0,0,0,1,4],
            [1,0,1,1,0,0,1,4],
            [1,0,1,0,0,0,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ],
        crates: [
            [2,3],
            [3,4],
            [4,4],
            [6,1],
            [6,3],
            [6,4],
            [6,5]
        ],
        spots: [
            [2,1],
            [3,5],
            [4,1],
            [5,4],
            [6,3],
            [6,6],
            [7,4]
        ],
        mario: [2,2]
    };
    self.createGame = () => {
        return game;
    }

})($sok.gameCreator = $sok.gameCreator || {});