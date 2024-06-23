const ctrls = require("../controllers/QuanLiSach");
const { verifyAccessToken } = require("../middlewares/verifyToken");
const router = require("express").Router();

router.all('*', verifyAccessToken)
router.post('/createNewBook',  ctrls.createNewBook);
// router.put('/updateBook', ctrls.updateBook);
router.post('/deleteBook', ctrls.deleteBook);
router.get('/getAllBooks', ctrls.getAllBooks);
router.get('/findBookByName', ctrls.findBookByName);
router.get('/findBookByBookID', ctrls.findBookByBookID);
router.get('/findBookByGenre', ctrls.findBookByGenre)

module.exports = router;