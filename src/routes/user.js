const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.get("/verify-email", ctrls.verifyEmail);
router.post('/login', ctrls.login);
router.post('/register', ctrls.register);
router.get('/get-refresh-token', ctrls.getRefreshToken);
router.post("/reset-password", [verifyAccessToken], ctrls.resetPassword);
router.get("/logout", (req, res) => {
    req.logout();
    // Xóa cookie của session
  });
module.exports = router;