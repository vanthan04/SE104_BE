const router = require("express").Router()
const ctrls = require("../controllers/QuanLiMuonTraSach")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.use('*', verifyAccessToken)
router.post('/book-borrow', ctrls.MuonSach)
router.post('/book-return', ctrls.TraSach)
router.get('/book-borrow-return', ctrls.getListBookBorrowReturnByReaderID)

module.exports = router;