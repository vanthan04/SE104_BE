require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const session = require('express-session');
const connectDB = require("./configs/connectDB")
const bodyParser = require("body-parser")
const passport = require("passport")
const cors = require("cors")
connectDB()
const initRoutes = require("./routes/index");
const app = express()

app.use(cors())



app.set('trust proxy', 1);

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: false,
  maxAge: 1000 * 60 * 15,
  cookie:{
      secure: true
        }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())




initRoutes(app);
const port = process.env.PORT || 6000
app.listen(port, () =>{
    console.log("Server is running in port: "+ port)
})