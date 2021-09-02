var bcrypt = require("bcryptjs");
const fs = require('fs');
const { userModel } = require("../models");

const { findOne } = userModel;

checkExistedUser = (req, res, next) => {
    const { username } = req.body;
    const existedUsername = findOne(username);
    const { isExist: isExisted } = existedUsername;

    if (!isExisted) {
        res.status(404).send({
            success: false,
            message: "ERROR_USER_NOT_REGISTERED",
        });
        return;
    }

    next();
};

verifyUserLogin = (req, res, next) => {
    const { username, password } = req.body;
    const existedUsername = findOne(username);
    const { userData } = existedUsername;

    let passwordIsValid = bcrypt.compareSync(
        password,
        userData.password
    );

    if (!passwordIsValid) {
        res.status(401).send({
            success: false,
            message: "ERROR_INVALID_PASSWORD"
        });
        return;
    }

    next();
}

const verifySignIn = {
    checkExistedUser,
    verifyUserLogin
};
module.exports = verifySignIn;