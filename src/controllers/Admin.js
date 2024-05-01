const AccountAdmin = require("../models/accountAdmin")

const CreateAccount = async (req, res) => {
    const {username, password} = req.params;
    const user = await AccountAdmin.findOne({username: username});
    if (!user){
        const newAccount = new AccountAdmin({
            username,
            password
        })
        await newAccount.save();
        return res.status(200).json({
            success: true,
            message: "Create account successfully!"
        })       
    }
    else{
        return res.status(400).json({
            success: false,
            message: "Create account failed!"
        })
    }
}

module.exports = {CreateAccount};