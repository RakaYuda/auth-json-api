const fs = require('fs');

const userPath = "./app/data/user-data.json";

const addUser = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(userPath, stringifyData)
}

const getAllUser = () => {
    const jsonData = fs.readFileSync(userPath)
    return JSON.parse(jsonData)
}

const findOne = (username) => {
    const existAccounts = getAllUser();
    let isExist = false;
    let userData = {};

    Object.keys(existAccounts).forEach((account) => {
        if (existAccounts[account].username === username) {
            isExist = true;
            userData = {
                ...userData,
                ...existAccounts[account],
                userId: account
            }
        }
    });

    return {
        isExist, userData
    }
}

const userModel = {
    addUser,
    getAllUser,
    findOne
};

module.exports = userModel;