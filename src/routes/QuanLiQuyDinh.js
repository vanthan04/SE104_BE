const router = require("express").Router();
const ctrls = require("../controllers/QuanLiQuyDinh")
const { verifyAccessToken } = require("../middlewares/verifyToken")

// router.all('*', verifyAccessToken)
router.get('/getReaderRule',  ctrls.getReaderRule)
router.put('/updateReaderRule', ctrls.updateReaderRule);
router.get('/getBookRule', ctrls.getBookRule);
router.put('/updatePulishYearDistance', ctrls.updatePulishYearDistance)
router.put('/updateGenre',  ctrls.updateGenre)
router.get('/getGenres',  ctrls.getGenres)


module.exports = router; 