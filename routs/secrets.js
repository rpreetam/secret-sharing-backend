require('dotenv').config();
var jwt = require('jsonwebtoken');
const express = require('express');
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Secret = require('../models/Secret');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the secrets using: GET "/api/secrets/fetchallsecrets". Login required
router.post('/fetchallsecrets', async (req, res) => {
    try {
        const secrets = await Secret.find();
        res.json(secrets)
    } catch (error) {
        console.error(error.message);

        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Add a Secret using: POST "/api/secrets/addsecret". Login required
router.post('/addsecret',  [
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { description } = req.body;
            const userId = req.body?.user?.id || jwt.verify( req.header('auth-token'),JWT_SECRET)?.user?.id  ;
           console.log('userId', userId);
            //check if user has already posted a secret
            const note = await Secret.findOne({ user: userId })
            if (note) {
                return res.status(403).json({ error: "Unauthorized: User is not allowed to add another post" });
            }
            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const secret = new Secret({
                description,
                user: userId

            })
            const savedSecret = await secret.save()

            res.json(savedSecret)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

module.exports = router