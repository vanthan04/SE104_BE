const jwt = require("jsonwebtoken")

const generateAccessToken = (uid) =>{
    const key = process.env.JWT_SECRET;
    let token = null;
    try {
        token =  jwt.sign({_id: uid}, key, {expiresIn: '30m'});
    } catch (err){
        console.log(err.message);
    }
    return token;
}

const generateRefreshToken = (uid) => {
    const key = process.env.JWT_SECRET;
    let token = null;
    try {
        token =  jwt.sign({_id: uid}, key, {expiresIn: '100d'});
    } catch (err){
        console.log(err.message);
    }
    return token;
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
}