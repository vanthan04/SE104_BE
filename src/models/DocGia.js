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
        reasonLocked: {
            type: String,
            default: null
        },
        ngaylapthe:{
            type: Date,
            require: true,
        },
        tongno:{
            type: Number,
            default: 0
        },
    },
    {
      timestamps: true  
    }
)


DocGiaSchema.methods = {
    updateReader: async function(minAge, maxAge, cardValue){
        if ((calculateDate(this.ngaysinh) < minAge || calculateDate(this.ngaysinh) > maxAge) && (calculateDate(this.ngaylapthe) > (cardValue/12) || calculateDate(this.ngaylapthe) < 0)){
            this.isLocked = true;
            this.reasonLocked = "Sai quy định ngày sinh && thẻ đã hết hạn!"
        }
        else if (calculateDate(this.ngaysinh) < minAge || calculateDate(this.ngaysinh) > maxAge){
            this.isLocked = true;
            this.reasonLocked = "Sai quy định ngày sinh!"
        } 
        else if (calculateDate(this.ngaylapthe) > (cardValue/12) || calculateDate(this.ngaylapthe) < 0){
            this.isLocked = true;
            this.reasonLocked = "Sai quy định ngày lập thẻ!"
        } else {
            this.isLocked = false;
            this.reasonLocked = null
        }
        await this.save();
    },
    isCardExpired: function(cardValue) {
        const currentDate = new Date();
        const expiryDate = new Date(this.ngaylapthe);
        expiryDate.setMonth(expiryDate.getMonth() + cardValue);
        return currentDate > expiryDate;
    }
}
module.exports = mongoose.model("DocGia", DocGiaSchema);