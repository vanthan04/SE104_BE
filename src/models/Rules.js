const mongoose = require("mongoose")

const Rules_Schema = new mongoose.Schema(
    {
        minAge:{
            type: Number,
        },
        maxAge:{
            type: Number
        },
        cardValue:{
            type: Number
        },
        genres: [
            {
                title:{
                    type: String
                }
            }
        ],
        Publishing_distance:{
            type: Number
        },
        MaxOfBorrowedBooks:{
            type: Number
        },
        MaxOfBorrowedDays:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Rules", Rules_Schema)