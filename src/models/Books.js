const mongoose = require("mongoose")
const TacGia = require("./TacGia")
const QuyDinhSach = require("./Book_Rules")

const BookSchema = new mongoose.Schema(
    {
        BookID:{
            type: String,
            required: true,
            unique: true
        },
        title:{
            type: String,
            required: true
        },
        genre:{
            type: String,
            required: true,
        },
        TacGia:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
        }],
        publishYear:{
            type: Number,
            required: true,
            min: calculateDateFromAge(8)
        },
        publisher:{
            type: String,
            required: true
        },
        dateofentry:{
            type: Date,
            required: true
        },
        condition:{
            type: String,
            enum: ["Còn Trống", "Đã mượn", "Mất"],
            default: "Còn Trống"
        },
        price:{
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