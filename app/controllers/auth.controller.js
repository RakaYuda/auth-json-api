const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');

var jwt = require("jsonwebtoken");

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

const createRefreshToken = async () => {
  let expiredAt = new Date();

  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

  let _token = uuidv4();

  //inserting a new refresh token to db
  let refreshToken = await this.create({
    token: _token,
    userId: user.id,
    expiryDate: expiredAt.getTime(),
  });

  return refreshToken.token;
}

const verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
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

  try {
    saveAccountData(newAccounts);
    res.send({ success: true, message: "SUCCESS_USER_REGISTER" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = (req, res) => {
  const { username } = req.body;
  const existedUsername = findExistedUsername(username);
  const { userData } = existedUsername;

  try {
    let token = jwt.sign({ id: userData.username }, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      username: userData.username,
      email: userData.email,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// exports.refreshToken = async (req, res) => {
//   const { refreshToken: requestToken } = req.body;

//   if (requestToken == null) {
//     return res.status(403).json({ message: "Refresh Token is required!" });
//   }

//   try {

//     //find refresh token in db
//     let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

//     console.log(refreshToken)

//     if (!refreshToken) {
//       res.status(403).json({ message: "Refresh token is not in database!" });
//       return;
//     }

//     //check if refresh token was expired and delete it from database
//     if (RefreshToken.verifyExpiration(refreshToken)) {

//       RefreshToken.destroy({ where: { id: refreshToken.id } });

//       res.status(403).json({
//         message: "Refresh token was expired. Please make a new signin request",
//       });
//       return;
//     }

//     //get a new access token
//     const user = await refreshToken.getUser();
//     let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
//       expiresIn: config.jwtExpiration,
//     });

//     //returning new access token and new refresh token
//     return res.status(200).json({
//       accessToken: newAccessToken,
//       refreshToken: refreshToken.token,
//     });

//   } catch (err) {
//     return res.status(500).send({ message: err });
//   }
// };



// exports.refreshToken = () => {
//   const refreshToken = {};
//   refreshToken.createToken = async function (user) {
//     let expiredAt = new Date();

//     expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

//     let _token = uuidv4();

//     let refreshToken = await this.create({
//       token: _token,
//       userId: user.id,
//       expiryDate: expiredAt.getTime(),
//     });

//     return refreshToken.token;
//   };

//   refreshToken.verifyExpiration = (token) => {
//     return token.expiryDate.getTime() < new Date().getTime();
//   };

// };

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