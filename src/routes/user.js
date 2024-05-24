const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");


router.post('/login', ctrls.login)
router.post('/register', ctrls.register)

module.exports = router;