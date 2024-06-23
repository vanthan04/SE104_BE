const { verifyAccessToken } = require("../middlewares/verifyToken");
const router = require("express").Router();
const ctrls = require("../controllers/LapPhieuThu")

router.use('*', verifyAccessToken)
router.post('/create-collection', ctrls.PhieuThuTienPhat)
router.get('/get-collection-by-readerID', ctrls.getCollectionListByReaderID)

module.exports = router;