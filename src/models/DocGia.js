const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const QuyDinhDocGia = require("./QuyDinhDocGia")

const calculateDateFromAge = (age) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - age);
    return date;
};

var DocGiaSchema = new mongoose.Schema(
    {
        MaDocGia:{
            type: String,
            required: true,
            unique: true
        },
        HoTenDocGia:{
            type: String,
            require:true
        },
        Email:{
            type: String,
            require: true,
            unique: true
        },
        Password:{
            type: String,
            require: true,
            default: "123456789"
        },
        DiaChi:{
            type: String,
        },
        LoaiDocGia:{
            type: String,
            enum: ['X', 'Y'],
            require: true
        },
        NgaySinh:{
            type: Date,
            min: calculateDateFromAge(55),
            max: calculateDateFromAge(18)
        },
        isLocked:{
            type: Boolean,
            default: false
        },
        NgayLapThe:{
            type: Date,
            require: true,
        },
        GiaTriSuDung:{
            type: Number,
        },
        refreshToken:{
            type: String,
            default: null,
        }
    },
    {
      timestamps: true  
    }
)

DocGiaSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.Passwordassword = await bcrypt.hash(this.Password, salt);
    }
    next();
});

DocGiaSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.Password);
    },
    updateQuyDinh: async function(){
        try {
            const latestRow = await QuyDinhDocGia.findOne().sort({createdAt: -1});
            if (!latestRow) {
                console.error(err);
                return;
            }


            const minNgaySinh = calculateDateFromAge(latestRow.TuoiToiThieu); 
            const maxNgaySinh = calculateDateFromAge(latestRow.TuoiToiDa);

            // Cập nhật giá trị cho trường NgaySinh trong userSchema
            this.path('NgaySinh').options.min = maxNgaySinh;
            this.path('NgaySinh').options.max = minNgaySinh;

            this.GiaTriSuDung = latestRow.GiaTriThe;


        } catch (error) {
            console.log(error)
        }
        
    }
}
module.exports = mongoose.model("DocGia", DocGiaSchema);