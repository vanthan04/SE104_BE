const mongoose = require("mongoose")
const TacGia = require("./TacGia")
const QuyDinhSach = require("./QuyDinhSach")

const calculateDateFromAge = (age) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - age);
    return date;
};

const SachSchema = new mongoose.Schema(
    {
        MaSach:{
            type: String,
            required: true,
            unique: true
        },
        TenSach:{
            type: String,
            required: true
        },
        TheLoaiSach:{
            type: String,
            required: true,
            enum: ["A", "B", "C"],
        },
        TacGia:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TacGia',
        }],
        NamXuatBan:{
            type: Number,
            required: true,
            min: calculateDateFromAge(8)
        },
        NhaXuatBan:{
            type: String,
            required: true
        },
        NgayNhap:{
            type: Date,
            required: true
        },
        TinhTrang:{
            type: String,
            enum: ["Còn Trống", "Đã mượn", "Mất"]
        },
        Gia:{
            type:Number,
            reuiqred: true
        }
    },
    {
        timestamps: true
    }
)


SachSchema.methods = {
    updateQuyDinh: async function(){
        try {
            const latestRow = await QuyDinhSach.findOne().sort({createdAt: -1});
            if (!latestRow) {
                console.error(err);
                return;
            }

            const theLoaiList = qds.DSTheLoai.map((item) => item.TenTheLoai);
            this.path("TheLoaiSach").enum(theLoaiList);

            const khoangcach = calculateDateFromAge(latestRow.KhoangCachXuatBan);
            this.path("NamXuatBan").options.min = khoangcach

        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = mongoose.model("Sach", SachSchema);