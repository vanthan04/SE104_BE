const mongoose = require("mongoose")
const MuonTraSachSchema = new mongoose.Schema(
    {
        ThongtinDocGia:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocGia'
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
            },
            {
                timestamps: true
            }
        ]

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("MuonTraSach", MuonTraSachSchema)