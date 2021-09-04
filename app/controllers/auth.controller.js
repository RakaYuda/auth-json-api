const config = require("../config/auth.config");
const { userModel } = require("../models");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const tokenModel = require("../models/token.model");

const { addUser, getAllUser, findOne } = userModel;
const { saveRefreshToken, getAllRefreshToken, findOneToken } = tokenModel;

const createRefreshToken = async (userId) => {
  const expiredAt = new Date();

  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

  const _token = uuidv4();

  const refreshToken = {
    token: _token,
    userId: userId,
    expiryDate: expiredAt.getTime(),
  };

  return refreshToken;
}

const verifyExpiration = (token) => {
  return token.expiryDate < new Date().getTime();
}

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  const listRefreshTokens = getAllRefreshToken();

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {

    //find refresh token in db
    const { isExist, foundToken: refreshToken } = findOneToken(requestToken);

    if (!isExist) {
      res.status(403).json({ success: true, message: "ERROR_INVALID_REFRESH_TOKEN" });
      return;
    }

    // check if refresh token was expired and delete it from database
    if (verifyExpiration(refreshToken)) {
      const indexObj = listRefreshTokens.indexOf(refreshToken);

      const newlistRefreshTokens = listRefreshTokens.splice(indexObj);

      saveRefreshToken(newlistRefreshTokens);
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    //get a new access token
    const userId = refreshToken.userId;
    let newAccessToken = jwt.sign({ id: userId }, config.secret, {
      expiresIn: config.jwtExpiration,
    });


    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
      success: true,
      message: "SUCCESS_REQUEST_REFRESH_TOKEN"
    });

  } catch (err) {
    return res.status(500).send({ message: err });
  }
};


exports.signup = (req, res) => {

  const existAccounts = getAllUser();
  const newAccountId = Math.floor(100000 + Math.random() * 900000);
  const { username, email, password } = req.body;
  const newAccount = {
    username,
    email,
    password: bcrypt.hashSync(password, 8)
  }

  const newAccounts = {
    ...existAccounts,
    [newAccountId]: newAccount
  }

  try {
    addUser(newAccounts);
    res.send({ success: true, message: "SUCCESS_USER_REGISTER" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  const { username } = req.body;
  const existedUser = findOne(username);
  const { username: existedUsername, userId } = existedUser.userData;

  try {
    let token = jwt.sign({ id: existedUsername }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    let refreshToken = await createRefreshToken(userId);

    const listRefreshTokens = getAllRefreshToken();

    const newListRefreshToken = [
      ...listRefreshTokens,
      refreshToken
    ];

    saveRefreshToken(newListRefreshToken);

    res.status(200).send({
      username: existedUsername,
      refreshToken: refreshToken.token,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};