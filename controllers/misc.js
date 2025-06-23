"use strict";

const IndependentGame = require('../models/independentGame');
// const globals = require('../helpers/globals');
const Newsletter = require('../models/newsletter');

async function newsletter(req, res) {
    const address = req.body?.address;
    if (typeof address == "string") {
        try {
            const foundNewsletter = await Newsletter.findOne({ where: { address } });
            if (foundNewsletter) {
                return res.status(409).json({ error: "Address is already in database." });
            }
            const newNewsletter = await Newsletter.create({ address });
            return res.status(200).json(newNewsletter);
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    } else {
        return res.status(400).json({ error: "Address must be a string." });
    }
}

async function postIndependentGame(req, res) {
    try {
        if ('verified' in req.body) {
            return res.status(400).json({ error: "Lolnope." })
        }
        const result = await IndependentGame.create(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const error0 = error.errors?.[0];
        console.log('\n   Debug: ', error0);
        if (error0?.type == 'unique violation') {
            return res.status(409).json({ error: error0?.message });
        }
        if (error0?.type == 'notNull Violation' || error0?.type == 'string violation') {
            return res.status(400).json({ error: error0?.message });
        }
        return res.status(500).json(error);
    }
}

module.exports = {
    newsletter,
    postIndependentGame,
};