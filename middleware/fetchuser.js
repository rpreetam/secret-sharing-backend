require('dotenv').config();
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    const user = req.body.user

    if (!token) {
        if (!user) {
            res.status(401).send({ error: "please authenticate using a valid token" })
            return;
        }
    }

    try {
        if (token) {
            const data = jwt.verify(token, JWT_SECRET);
            req.user = data.user
        }
        else {
            req.user = user;

        }


        next();

    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
        console.log("error:", error)
    }


}

module.exports = fetchuser;
