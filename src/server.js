require("dotenv").config()
const express = require("express")
const session = require('express-session');
const connectDB = require("./configs/connectDB")
const bodyParser = require("body-parser")
const passport = require("passport")
const cors = require("cors")
connectDB()
const initRoutes = require("./routes/index")
const app = express()

app.use(cors())

app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false
  }));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(passport.initialize());
app.use(passport.session());


initRoutes(app);
const port = process.env.PORT || 6000
app.listen(port, () =>{
    console.log("Server is running in port: "+ port)
})