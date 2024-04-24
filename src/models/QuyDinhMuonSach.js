const mongoose = require("mongoose")

const QDMSSchema = new mongoose.Schema(
    {
        SoLuongSachMuonToiDa:{
            type: Number
        },
        SoNgayMuonToiDa:{
            type: Number
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("QuyDinhMuonSach", QDMSSchema)