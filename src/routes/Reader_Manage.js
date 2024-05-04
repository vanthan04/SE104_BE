const router = require("express").Router()
const ctrls = require("../controllers/Reader_Manage")
const { verifyAccessToken } = require("../middlewares/verifyToken")

router.post('/createNewReader', verifyAccessToken, ctrls.createNewReader)
router.post('/updateReader', ctrls.updateReader)
router.post('/deleteReader', ctrls.deleteReader)
router.get('/getAllReaders', [verifyAccessToken], ctrls.getAllReaders)
router.get('/findReaderByReaderID', ctrls.findReaderByReaderID)
router.get('/findReaderByEmail', ctrls.findReaderByEmail)
router.get('/findReaderByFullname', ctrls.findReaderByFullname)

module.exports = router;