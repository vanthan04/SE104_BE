const mongoose = require("mongoose")

const Book_Return_Schema = new mongoose.Schema(
    {
        ReturnedBooksList:[
            {
                ReturnInfo:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Book_Borrow'
                },
                ReturnDate:{
                    type: Date
                },
                FineMoney:{
                    type: Number
                }
            }
        ],
    },
    {
        timestamps: true
    }
)