const userRouter = require("./user")
const adminRouter = require("./Admin")
const Reader_Manage_Router = require("./QuanLiDocGia")
const Rule_Manage_Router = require("./QuanLiQuyDinh")
const Book_Manage_Router = require("./QuanLiSach")
const BookBorrowReturn = require("./QuanLiMuonTraSach")
const { notFound, errHandler } = require("../middlewares/errHandler")
const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/admin', adminRouter)
    app.use('/api/readerManage', Reader_Manage_Router)
    app.use('/api/ruleManage', Rule_Manage_Router)
    app.use('/api/bookManage', Book_Manage_Router)
    app.use('/api/book-borrow-return', BookBorrowReturn)
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;