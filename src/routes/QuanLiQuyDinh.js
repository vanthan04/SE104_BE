const router = require("express").Router();
const ctrls = require("../controllers/QuanLiQuyDinh")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.get('/getReaderRule', verifyAccessToken, ctrls.getReaderRule)
router.put('/updateReaderRule', verifyAccessToken, ctrls.updateReaderRule);
router.get('/getBookRule', verifyAccessToken, ctrls.getBookRule);
router.put('/updatePulishYearDistance', verifyAccessToken, ctrls.updatePulishYearDistance)
router.post('/addGenre', verifyAccessToken, ctrls.addGenre);
router.delete('/deleteGenre', verifyAccessToken, ctrls.deleteGenre)


module.exports = router;