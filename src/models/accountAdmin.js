const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

var accountSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
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

accountSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

accountSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.password);
    }
}
module.exports = mongoose.model("AccountAdmins", accountSchema);