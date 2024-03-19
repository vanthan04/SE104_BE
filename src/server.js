require("dotenv").config()
const express = require("express")
const connectDB = require("./configs/connectDB")

connectDB()
const app = express()

const port = process.env.PORT || 6000
app.listen(port, ()=>{
    console.log("Server is running in port: "+ port)
})