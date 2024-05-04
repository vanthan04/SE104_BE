const mongoose = require("mongoose")
const Book_Borrow_Return_Schema = new mongoose.Schema(
    {
        ReaderInfor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Readers'
        },
        BorrowedBooksList:[
            {
                BookBorrow:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Books'
                },
                dateofBorrow: {
                    type: Date
                },
                dateofReturn:{
                    type: Date
                }
            }
        ]

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Book_Borrow_Return", Book_Borrow_Return_Schema)