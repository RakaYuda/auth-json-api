const { verifySignUp, verifySignIn } = require("../middleware");
const controller = require("../controllers/auth.controller");

const { signup, signin, refreshToken } = controller;

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkExistedUsername
        ],
        signup
    );

    app.post(
        "/api/auth/signin",
        [
            verifySignIn.checkExistedUser,
            verifySignIn.verifyUserLogin
        ],
        signin
    );

    app.post(
        "/api/auth/refresh-token",
        refreshToken
    );
};