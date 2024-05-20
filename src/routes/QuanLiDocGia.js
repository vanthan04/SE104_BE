const router = require("express").Router()
const ctrls = require("../controllers/QuanLiDocGia")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.post('/createNewReader', verifyAccessToken, ctrls.createNewReader)
router.post('/updateReader', verifyAccessToken ,ctrls.updateReader)
router.post('/deleteReader', verifyAccessToken, ctrls.deleteReader)
router.get('/getAllReaders', verifyAccessToken, ctrls.getAllReaders)
router.get('/findReaderByMaDG', verifyAccessToken, ctrls.findReaderByMaDG)
router.get('/findReaderByEmail', verifyAccessToken, ctrls.findReaderByEmail)
router.get('/findReaderByFullname',verifyAccessToken, ctrls.findReaderByFullname)

module.exports = router;