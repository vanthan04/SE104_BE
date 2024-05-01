const router = require("express").Router()
const ctrls = require("../controllers/Reader_Manage")

router.post('/createNewReader', ctrls.createNewReader)

module.exports = router;