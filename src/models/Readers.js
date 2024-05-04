const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const {calculateDate} = require("../helps/calculateTime")

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
    updateReader: async function(minAge, maxAge, cardValue){
        if (calculateDate(this.dateofbirth) < minAge || calculateDate(this.dateofbirth) > maxAge){
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }
        if (calculateDate(this.CardIssuanceDate) > (cardValue/12) || calculateDate(this.CardIssuanceDate) < 0){
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }
        await this.save();
    }
}
module.exports = mongoose.model("Readers", ReaderSchema);