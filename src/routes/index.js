const userRouter = require("./user")
const adminRouter = require("./Admin")
const Reader_Manage_Router = require("./Reader_Manage")
const Rule_Manage_Router = require("./Rule_Manage")

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/admin', adminRouter)
    app.use('/api/reader_manage', Reader_Manage_Router)
    app.use('/api/rule_manage', Rule_Manage_Router)
}

module.exports = initRoutes;