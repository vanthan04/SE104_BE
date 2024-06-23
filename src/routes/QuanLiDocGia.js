const router = require("express").Router()
const ctrls = require("../controllers/QuanLiDocGia")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.all('*', verifyAccessToken)
router.post('/createNewReader', ctrls.createNewReader)
router.put('/updateReader', ctrls.updateReader)
router.post('/deleteReader', ctrls.deleteReader)
router.get('/getAllReaders', ctrls.getAllReaders)
router.get('/findReaderByMaDG', ctrls.findReaderByMaDG)
router.get('/findReaderByEmail', ctrls.findReaderByEmail)
router.get('/findReaderByFullname', ctrls.findReaderByFullname)
router.get('/findReader', ctrls.findReader)
router.get('/getListReaders', ctrls.getListReaders)

module.exports = router;