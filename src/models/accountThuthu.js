const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

var accountThuthuSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            unique: true,
            required: true
        },
        password:{
            type: String,
            required: true
        },
        fullname:{
            type: String,
        },
        refreshToken:{
            type:String,
            default: null
        },
    },
    {
        timestamps: true
    } 
)

accountThuthuSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

accountThuthuSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.password);
    }
}
module.exports = mongoose.model("accountThuthu", accountThuthuSchema);
