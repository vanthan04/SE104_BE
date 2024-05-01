const mongoose = require("mongoose")
const Book_Borrow_Schema = new mongoose.Schema(
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
                dateofBorrowing: {
                    type: Date
                },
                timestamps: true
            }
        ]

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Book_Borrow", Book_Borrow_Schema)