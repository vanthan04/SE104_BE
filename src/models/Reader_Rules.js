const mongoose = require("mongoose")

const Reader_Rules_Schema = new mongoose.Schema(
    {
        minAge:{
            type: Number,
        },
        maxAge:{
            type: Number
        },
        cardValue:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Reader_Rules", Reader_Rules_Schema)