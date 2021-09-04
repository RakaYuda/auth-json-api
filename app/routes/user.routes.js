const { authJwt } = require("../middleware");
// const controller = require("../controllers/user.controller");
const controller = require("../controllers/user.controller");

const { verifyToken } = authJwt;
const { userBoard, adminBoard, allAccess } = controller;
// const { getList } = controller;

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // app.get("/api/get/all", controller.getList);

    app.get("/api/test/all", allAccess);

    app.get(
        "/api/test/user",
        [verifyToken],
        userBoard
    );

    app.get(
        "/api/test/admin",
        [verifyToken],
        adminBoard
    );
};