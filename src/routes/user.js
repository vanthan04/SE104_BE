const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");


router.post('/loginAdmin', ctrls.loginAdmin)

module.exports = router;