const fs = require('fs');

const tokenPath = "./app/data/refreshtoken-data.json";

const saveRefreshToken = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(tokenPath, stringifyData)
}

const getAllRefreshToken = () => {
    const jsonData = fs.readFileSync(tokenPath)
    return JSON.parse(jsonData)
}

const findOneToken = (refreshToken) => {
    const existTokens = getAllRefreshToken();
    let isExist = false;

    const foundToken = existTokens.find(token => token.token === refreshToken)

    isExist = !!foundToken

    return {
        isExist,
        foundToken
    }
}

const tokenModel = {
    saveRefreshToken,
    getAllRefreshToken,
    findOneToken
};

module.exports = tokenModel;