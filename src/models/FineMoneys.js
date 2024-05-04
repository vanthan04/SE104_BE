const mongoose = require("mongoose")

const FineMoneySchema = new mongoose.Schema(
    {
        Book_Borrow_Return:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book_Borrow_Return'
        },
        Late_payment_date:{
            type: Date
        },
        dateofPayment:{
            type: Date
        },
        FineMoney:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('FineMoney', FineMoneySchema)