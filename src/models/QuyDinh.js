const mongoose = require("mongoose")

const QuyDinhSchema = new mongoose.Schema(
    {
        tuoitoithieu:{
            type: Number,
            default: -Infinity
        },
        tuoitoida:{
            type: Number,
            default: Infinity
        },
        giatrithe:{
            type: Number,
            default: Infinity
        },

        DStheloai: {
            type: [
              {
                tentheloai: {
                  type: String
                }
              }
            ],
            default: []
        },
        khoangcachxuatban:{
            type: Number,
            default: Infinity
        },
        soluongsachmuontoida:{
            type: Number,
            default: Infinity
        },
        songaymuontoida:{
            type: Number,
            default: Infinity
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("QuyDinh", QuyDinhSchema)