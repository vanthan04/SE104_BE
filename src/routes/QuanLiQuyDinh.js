const router = require("express").Router();
const ctrls = require("../controllers/QuanLiQuyDinh")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.all('*', verifyAccessToken)
router.get('/getReaderRule',  ctrls.getReaderRule)
router.put('/updateReaderRule', ctrls.updateReaderRule);
router.get('/getBookRule', ctrls.getBookRule);
router.put('/updatePulishYearDistance', ctrls.updatePulishYearDistance)
router.put('/updateGenre',  ctrls.updateGenre)
router.get('/getGenres',  ctrls.getGenres)
router.get('/get-book-borrow-return-rule', ctrls.getBookBorrowReturnRule)
router.put('/update-book-borrow-return-rule', ctrls.updateBookBorrowReturnRule)


module.exports = router; 