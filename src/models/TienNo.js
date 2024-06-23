const mongoose = require("mongoose");

const TienNoSchema = new mongoose.Schema(
    {
        ThongTinDocGia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocGia'
        },
        SachTra: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sach'
        },
        ngaytra: {
            type: Date
        },
        ngaytraquydinh: {
            type: Date
        },
        tienno: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('TienNo', TienNoSchema);
