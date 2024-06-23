const userRouter = require("./user")
const Reader_Manage_Router = require("./QuanLiDocGia")
const Rule_Manage_Router = require("./QuanLiQuyDinh")
const Book_Manage_Router = require("./QuanLiSach")
const BookBorrowReturn = require("./QuanLiMuonTraSach")
const ReportRouter = require("./BaoCao")
const CollectionRouter = require("./PhieuThu")
const { notFound, errHandler } = require("../middlewares/errHandler")

const initRoutes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/readerManage', Reader_Manage_Router);
    app.use('/api/ruleManage', Rule_Manage_Router);
    app.use('/api/bookManage', Book_Manage_Router);
    app.use('/api/book-borrow-return', BookBorrowReturn);
    app.use('/api/report', ReportRouter);
    app.use('/api/collection', CollectionRouter)
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;