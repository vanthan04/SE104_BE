const router = require("express").Router();
const ctrls = require("../controllers/QuanLiQuyDinh")

router.get('/getReaderRule', ctrls.getReaderRule)
// router.post('/capnhatquydinhdocgia', ctrls.capnhatquydinhdocgia);
// router.get('/layquydinhsach', ctrls.layquydinhsach)
// router.post('/updateBookRules', ctrls.capnhatquydinhdocgia)

module.exports = router;