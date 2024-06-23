const mongoose = require("mongoose")

const QuyDinhSchema = new mongoose.Schema(
    {
        tuoitoithieu:{
            type: Number,
        },
        tuoitoida:{
            type: Number,
        },
        giatrithe:{
            type: Number,
            default: Infinity
        },
        DStheloai: [
            {
                tentheloai: {
                    type: String,
                }
            }
        ],
        khoangcachxuatban:{
            type: Number,
        },
        soluongsachmuontoida:{
            type: Number,
        },
        songaymuontoida:{
            type: Number,
        },
        tienphatmoingay:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("QuyDinh", QuyDinhSchema)