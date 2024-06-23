const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.get("/verify-email", ctrls.verifyEmail);
router.get("/current", [verifyAccessToken], ctrls.getCurrent);
router.post("/forget-password", ctrls.forgetPassword);
router.post('/login', ctrls.login);
router.post('/register', ctrls.register);
router.get('/get-refresh-token', [verifyAccessToken], ctrls.getRefreshToken);
router.post("/reset-password", [verifyAccessToken], ctrls.resetPassword);
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      // Xóa cookie chứa refreshToken
      res.clearCookie('refreshToken'); // Tên cookie chứa refreshToken
      res.clearCookie('connect.sid'); // Tên cookie session nếu sử dụng cookie-session
      res.status(200).send('Đăng xuất thành công');
    });

  });
});
module.exports = router;