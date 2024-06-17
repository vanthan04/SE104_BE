const router = require("express").Router()
const ctrls = require("../controllers/BaoCao")
const { verifyAccessToken } = require("../middlewares/verifyToken")

// router.use('*', verifyAccessToken);
router.get('/genre-month', ctrls.BaoCaoThongKeTinhHinhMuonSachTheoThangVaTheLoai)

module.exports = router