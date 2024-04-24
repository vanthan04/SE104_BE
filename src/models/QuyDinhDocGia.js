const mongoose = require("mongoose")

const QDDGSchema = new mongoose.Schema(
    {
        TuoiToiThieu:{
            type: Number,
        },
        TuoiToiDa:{
            type: Number
        },
        GiaTriThe:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("QuyDinhDocGia", QDDGSchema)