const AccountAdmins = require("../models/accountAdmin")

const CreateAccount = async (req, res) => {
    const {username, password} = req.params;
    const user = await AccountAdmins.findOne({username: username});
    if (!user){
        const newAccount = new AccountAdmins({
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