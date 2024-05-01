const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const Reader_Rules = require("./Reader_Rules")


var ReaderSchema = new mongoose.Schema(
    {
        readerID:{
            type: String,
            required: true,
            unique: true
        },
        fullname:{
            type: String,
            require:true
        },
        email:{
            type: String,
            require: true,
            unique: true
        },
        password:{
            type: String,
            require: true,
        },
        address:{
            type: String,
        },
        typeofReader:{
            type: String,
            enum: ['X', 'Y'],
            require: true
        },
        dateofbirth:{
            type: Date,
        },
        isLocked:{
            type: Boolean,
            default: false
        },
        CardIssuanceDate:{
            type: Date,
            require: true,
        },
        total_owed:{
            type: Number,
            default: 0
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

ReaderSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

ReaderSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.Password);
    },
    // updateQuyDinh: async function(){
    //     try {
    //         const latestRow = await Reader_Rules.findOne().sort({createdAt: -1});
    //         if (!latestRow) {
    //             console.error(err);
    //             return;
    //         }


    //         const minNgaySinh = calculateDateFromAge(latestRow.TuoiToiThieu); 
    //         const maxNgaySinh = calculateDateFromAge(latestRow.TuoiToiDa);

    //         // Cập nhật giá trị cho trường NgaySinh trong userSchema
    //         this.path('NgaySinh').options.min = maxNgaySinh;
    //         this.path('NgaySinh').options.max = minNgaySinh;

    //         this.GiaTriSuDung = latestRow.GiaTriThe;


    //     } catch (error) {
    //         console.log(error)
    //     }
        
    // }
}
module.exports = mongoose.model("Readers", ReaderSchema);