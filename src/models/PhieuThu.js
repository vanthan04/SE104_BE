const mongoose = require("mongoose");

var PhieuThuSchema = new mongoose.Schema(
    {
        MaDG:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        tiennohientai:{
            type: Number
        },
        tienthu: {
            type: Number,
            required: true
        },
        ngaythu: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("PhieuThu", PhieuThuSchema);