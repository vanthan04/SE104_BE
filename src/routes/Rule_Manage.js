const router = require("express").Router();
const ctrls = require("../controllers/Rule_Manage")

router.get('/getReaderRules', ctrls.getReaderRules)
router.post('/updateReaderRules', ctrls.updateReaderRules);
router.get('/getBookRules', ctrls.getBookRules)
router.post('/updateBookRules', ctrls.updateBookRules)

module.exports = router;