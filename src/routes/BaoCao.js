const router = require("express").Router()
const ctrls = require("../controllers/BaoCao")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.use('*', verifyAccessToken);
router.get('/genre-month', ctrls.BaoCaoThongKeTinhHinhMuonSachTheoThangVaTheLoai);
router.get('/late-return-book', ctrls.getLateReturnBooksReport);
router.get('/download-genre-month', ctrls.DownLoadDSMuonSachTheoThangVaTheLoai);
router.get('/download-late-return-book', ctrls.DownLoadLateReturnBooksReport);

module.exports = router