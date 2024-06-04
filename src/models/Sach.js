const mongoose = require("mongoose")
const TacGia = require("./TacGia")

const SachSchema = new mongoose.Schema(
    {
        MaSach:{
            type: String,
            required: true,
            unique: true
        },
        tensach:{
            type: String,
            required: true
        },
        theloai:{
            type: String,
            required: true,
        },
        tacgia:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
        }],
        namxuatban:{
            type: Number,
            required: true,
        },
        nhaxuatban:{
            type: String,
            required: true
        },
        ngaynhap:{
            type: Date,
            required: true
        },
        tinhtrang:{
            type: String,
            enum: ["Còn Trống", "Đã mượn", "Mất"],
            default: "Còn Trống"
        },
        
        gia:{
            type: Number,
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
            

        } catch (error) {
            console.log(error)
        }
    },
    getListTacGia: async function(){
        try {
            const listacgia =  await Promise.all(this.tacgia.map(async (tacgiaid) => {
                const tg = await TacGia.findById(tacgiaid);
                return tg ? tg.tentacgia : null;
            }))
            return listacgia.filter(tentacgia => tentacgia !== null);
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = mongoose.model("Sach", SachSchema);