const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const {calculateDate} = require("../helps/calculateTime")

var DocGiaSchema = new mongoose.Schema(
    {
        MaDG:{
            type: String,
            required: true,
            unique: true
        },
        hoten:{
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
            require: true
        },
        diachi:{
            type: String,
        },
        loaidocgia:{
            type: String,
            enum: ['X', 'Y'],
            require: true
        },
        ngaysinh:{
            type: Date,
        },
        isLocked:{
            type: Boolean,
            default: false
        },
        ngaylapthe:{
            type: Date,
            require: true,
        },
        tongno:{
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

DocGiaSchema.pre('save', async function(next) {
    if (!this.password) {
        // Nếu mật khẩu không được cung cấp, tạo mật khẩu mặc định
        const defaultPassword = '123456789'; // Bạn có thể thay đổi thành mật khẩu mặc định mong muốn
        // Hash mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(defaultPassword, salt);
    } else {
        // Nếu mật khẩu đã được cung cấp, hash mật khẩu trước khi lưu
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
    next();
});

DocGiaSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.Password);
    },
    updateReader: async function(minAge, maxAge, cardValue){
        if (calculateDate(this.ngaysinh) < minAge || calculateDate(this.ngaysinh) > maxAge){
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }
        if (calculateDate(this.ngaylapthe) > (cardValue/12) || calculateDate(this.ngaylapthe) < 0){
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }
        await this.save();
    }
}
module.exports = mongoose.model("DocGia", DocGiaSchema);