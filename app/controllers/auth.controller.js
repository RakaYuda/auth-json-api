const config = require("../config/auth.config");
const fs = require('fs');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const dataPath = "./app/data/user-data.json";

const saveAccountData = (data) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync(dataPath, stringifyData)
}

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

exports.signup = (req, res) => {

  const existAccounts = getAccountData();
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

  const existedUsername = findExistedUsername(username);
  const { isExist } = existedUsername;

  if (isExist) {
    res.send({ success: false, msg: "ERROR_USERNAME_NOT_AVAILABLE" })
  }

  saveAccountData(newAccounts);
  res.send({ success: true, msg: "SUCCESS_USER_REGISTER" })

};

exports.signin = (req, res) => {
  const { username, email, password } = req.body;
  const existedUsername = findExistedUsername(username);
  const { isExist, userData } = existedUsername;

  if (!isExist) {
    return res.status(404).send({ message: "ERROR_USER_NOT_FOUND" });
  }

  let passwordIsValid = bcrypt.compareSync(
    password,
    userData.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "ERROR_INVALID_PASSWORD"
    });
  }

  let token = jwt.sign({ id: userData.username }, config.secret, {
    expiresIn: 86400 // 24 hours
  });

  res.status(200).send({
    username: userData.username,
    email: userData.email,
    accessToken: token
  });

};

// exports.signin = (req, res) => {
//   User.findOne({
//     where: {
//       username: req.body.username
//     }
//   })
//     .then(user => {
//       if (!user) {
//         return res.status(404).send({ message: "User Not found." });
//       }

//       var passwordIsValid = bcrypt.compareSync(
//         req.body.password,
//         user.password
//       );

//       if (!passwordIsValid) {
//         return res.status(401).send({
//           accessToken: null,
//           message: "Invalid Password!"
//         });
//       }

//       var token = jwt.sign({ id: user.id }, config.secret, {
//         expiresIn: 86400 // 24 hours
//       });

//       var authorities = [];
//       user.getRoles().then(roles => {
//         for (let i = 0; i < roles.length; i++) {
//           authorities.push("ROLE_" + roles[i].name.toUpperCase());
//         }
//         res.status(200).send({
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           roles: authorities,
//           accessToken: token
//         });
//       });
//     })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
// };