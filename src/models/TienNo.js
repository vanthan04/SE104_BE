const mongoose = require("mongoose")

const TienNoSchema = new mongoose.Schema(
    {
        SachTra:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MuonTraSach'
        },
        ngaytra:{
            type: Date
        },
        ngaytramuon:{
            type: Date
        },
        tienno:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('TienNo', TienNoSchema)