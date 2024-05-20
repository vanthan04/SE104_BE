const mongoose = require("mongoose")
const MuonTraSachSchema = new mongoose.Schema(
    {
        ThongtinDocGia:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Readers'
        },
        DanhSachMuon:[
            {
                sachmuon:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Sach'
                },
                ngaymuon: {
                    type: Date
                },
                ngaytra:{
                    type: Date
                }
            }
        ]

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("MuonTraSach", Book_Borrow_Return_Schema)