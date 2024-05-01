const mongoose = require("mongoose")

const Book_Borrowing_Rules_Schema = new mongoose.Schema(
    {
        MaxOfBorrowedBooks:{
            type: Number
        },
        MaxOfBorrowedDays:{
            type: Number
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Book_Borrowing_Rules", Book_Borrowing_Rules_Schema)