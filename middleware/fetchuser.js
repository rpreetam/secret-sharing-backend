var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    const user = req.body.user

    console.log("token before verification", token);
    console.log("user before verification", user);
    if (!token){
        console.log("no token found")
        if (!user){
            console.log("no user found")
        res.status(401).send({error:"please authenticate using a valid token"})
        console.log("returning no token and user found");
        return;
        }
    }

    try {
        if (token !== "null") {
            console.log("token:", token)
            const data = jwt.verify(token, JWT_SECRET);
            req.user =  data.user
     }
      else{  req.user = user;

      }

      console.log("precessing next function")

      next();
       
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
        console.log("error:",error)
    }


}

module.exports = fetchuser;