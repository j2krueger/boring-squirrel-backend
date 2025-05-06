"use strict";

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

module.exports = {
    newsletter,
};