const router = require("express").Router();
const ctrls = require("../controllers/QuanLiQuyDinh")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.get('/getReaderRule',  ctrls.getReaderRule)
router.put('/updateReaderRule', ctrls.updateReaderRule);
router.get('/getBookRule', verifyAccessToken, ctrls.getBookRule);
router.put('/updatePulishYearDistance', verifyAccessToken, ctrls.updatePulishYearDistance)
router.put('/updateGenre',  ctrls.updateGenre)
router.get('/getGenres',  ctrls.getGenres)


module.exports = router;