require("dotenv").config()
const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.URL_MONGOOSE)
        if (con.connection.readyState === 1)
            console.log("Connect DB successfully!")
        else
            console.log("Connect DB falied!")
    } catch (error) {
       throw new Error(error);
    }
}

module.exports = connectDB;