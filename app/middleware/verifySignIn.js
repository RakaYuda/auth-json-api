var bcrypt = require("bcryptjs");
const fs = require('fs');
const dataPath = "./app/data/user-data.json";


const getAccountData = () => {
    const jsonData = fs.readFileSync(dataPath)
    return JSON.parse(jsonData)
}

const findExistedUsername = (username) => {
    const existAccounts = getAccountData();
    let isExist = false;
    let userData = {};

    Object.keys(existAccounts).forEach((account) => {
        if (existAccounts[account].username === username) {
            isExist = true;
            userData = {
                ...userData,
                ...existAccounts[account]
            }
        }
    });
    return {
        isExist, userData
    }
}

checkExistedUser = (req, res, next) => {
    const { username } = req.body;
    const existedUsername = findExistedUsername(username);
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
    const existedUsername = findExistedUsername(username);
    const { userData } = existedUsername;

    let passwordIsValid = bcrypt.compareSync(
        password,
        userData.password
    );

    if (!passwordIsValid) {
        res.status(401).send({
            success: false,
            accessToken: null,
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