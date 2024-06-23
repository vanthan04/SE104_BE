const mongoose = require("mongoose");

const SachSchema = new mongoose.Schema(
    {
        MaSach: {
            type: String,
            required: true,
            unique: true
        },
        tensach: {
            type: String,
            required: true
        },
        theloai: {
            type: String,
            required: true,
        },
        tacgia: [{
            type: String,
            required: true
        }],
        namxuatban: {
            type: Number,
            required: true,
        },
        nhaxuatban: {
            type: String,
            required: true
        },
        ngaynhap: {
            type: Date,
            required: true
        },
        tinhtrang: {
            type: String,
            enum: ["Còn Trống", "Đã mượn", "Vi Phạm"],
            default: "Còn Trống"
        },
        docgiamuon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocGia',
            default: null
        },
        gia: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

SachSchema.methods = {
    updateQuyDinh: async function() {
        try {
            
        } catch (error) {
            console.log(error);
        }
    },
};

// Thêm phương thức tĩnh để đếm số lượng tên tác giả khác nhau
SachSchema.statics.countDistinctTacGia = async function() {
    try {
        const distinctTacGia = await this.aggregate([
            { $unwind: "$tacgia" },
            { $group: { _id: "$tacgia" } }, // Thay vì "$tacgia.tentacgia"
            { $count: "distinctCount" }
        ]);
        return distinctTacGia.length > 0 ? distinctTacGia[0].distinctCount : 0;
    } catch (error) {
        console.log(error);
        return -1;
    }
};

module.exports = mongoose.model("Sach", SachSchema);
