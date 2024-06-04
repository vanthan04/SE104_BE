const ctrls = require("../controllers/QuanLiSach");
const { verifyAccessToken } = require("../middlewares/verifyToken");
const router = require("express").Router();

router.post('/createNewBook',  ctrls.createNewBook);
router.post('/updateBook', verifyAccessToken, ctrls.updateBook);
router.post('/deleteBook', verifyAccessToken, ctrls.deleteBook);
router.get('/getAllBooks', ctrls.getAllBooks);
router.get('/findBookByName', verifyAccessToken, ctrls.findBookByName);
router.get('/findBookByBookID', verifyAccessToken, ctrls.findBookByBookID);
router.get('/findBookByGenre', verifyAccessToken, ctrls.findBookByGenre)

module.exports = router;