const jwt = require("jsonwebtoken");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const verifyAccessToken = asyncHandler(async (req, res, next) => {
    
})

module.exports = {verifyAccessToken};