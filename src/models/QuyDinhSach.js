const mongoose = require("mongoose")

const QDSSchema = new mongoose.Schema(
    {
        DSTheLoai: [
            {
                TenTheLoai:{
                    type: String
                }
            }
        ],
        KhoangCachXuatBan:{
            type: Number
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("QuyDinhSach", QDSSchema)