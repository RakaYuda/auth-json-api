const fs = require('fs');
const dataPath = "./app/data/user-data.json";


const getAccountData = () => {
    const jsonData = fs.readFileSync(dataPath)
    return JSON.parse(jsonData)
}

checkExistedUsername = (req, res, next) => {
    const existAccounts = getAccountData();
    let isExisted = false;
    const { username } = req.body;

    Object.keys(existAccounts).forEach((account) => {
        if (existAccounts[account].username === username) {
            isExisted = true;
        }
    });

    if (isExisted) {
        return res.status(400).send({
            success: false,
            message: "ERROR_USERNAME_NOT_AVAILABLE"
        });
    }

    next();
}


const verifySignUp = {
    checkExistedUsername
};

module.exports = verifySignUp;