const express = require('express');
const fetch = require('node-fetch')
require('dotenv').config();
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
console.log("client id:",client_id)

// ROUTE 1: Create a User using: POST "/api/auth/create". No login required

router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    // if there are errors return Bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }
    try {
        // check whether the user with this email exist already

        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });
        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);

        // res.json(user)
        success = true;
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }

})


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank'),

], async (req, res) => {
    let success = false;
    // If there are errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })
        if (!user) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials" })

        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error")

    }

});


// ROUTE 3: Get loggedin User Details using : POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error")
    }
})
// Route 4 Authenticate a User using: POST "/api/auth/google". No login required 
router.post('/google', (req, res) => {
    const { code } = req.body;
    console.log("code in be",code);

    const grant_type = 'authorization_code';

    fetch('<https://oauth2.googleapis.com/token>', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type,
        }),
    })
        .then(response => {
        console.log(".then response",response)
    return response.json()})
        .then(tokens => {
            // Send the tokens back to the frontend, or store them securely and create a session
            res.json(tokens);
        })

        .catch(error => {
            // Handle errors in the token exchange
            console.error('Token exchange error:', error);
            console.log("in catch",)
            res.status(500).send({ error: 'Internal Server Error' });
        });
});
module.exports = router