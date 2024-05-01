const mongoose = require("mongoose")

const Book_Rules_Schema = new mongoose.Schema(
    {
        genres: [
            {
                title:{
                    type: String
                }
            }
        ],
        Publishing_distance:{
            type: Number
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Book_Rules", Book_Rules_Schema)