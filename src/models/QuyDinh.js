const mongoose = require("mongoose")

const QuyDinhSchema = new mongoose.Schema(
    {
        tuoitoithieu:{
            type: Number,
        },
        tuoitoida:{
            type: Number
        },
        giatrithe:{
            type: Number
        },
        DStheloai: [
            {
                tentheloai:{
                    type: String
                }
            }
        ],
        khoangcachxuatban:{
            type: Number
        },
        soluongsachmuontoida:{
            type: Number
        },
        songaymuontoida:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("QuyDinh", QuyDinhSchema)