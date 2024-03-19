require("dotenv").config()
const express = require("express")
const connectDB = require("./configs/connectDB")
const bodyParser = require("body-parser")
connectDB()
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const port = process.env.PORT || 6000
app.listen(port, ()=>{
    console.log("Server is running in port: "+ port)
})