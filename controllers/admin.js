"use strict";

const { IndependentGame } = require('../models/combined');

async function getIndependentGame(req, res) {
    const games = await IndependentGame.findAll();
    return res.status(200).json(games);
}

module.exports = {
    getIndependentGame,
}