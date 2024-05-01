const router = require("express").Router()
const ctrls = require("../controllers/Admin")

router.post('/createaccountadmin/:username-:password', ctrls.CreateAccount)
// router.post('/updateaccountadmin/:username-:password', ctrls.UpdateAccount)
// router.post('/deleteaccountadmin/:username-:password', ctrls.DeleteAccount)

module.exports = router;