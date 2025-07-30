"use strict";

// const globals = require('../helpers/globals');
const gamesArray = [
    {
        id: 1,
        name: 'Acorn Sweeper',
        description: 'Minesweeper, but with a squirrel theme.',
        rules: 'Left click on a square to reveal what\'s there. Right click on an unrevealed square to mark or unmark it.',
    }
];

async function getGame(req,res) {
    return res.status(200).json(gamesArray);
}

module.exports = {
    getGame,
}