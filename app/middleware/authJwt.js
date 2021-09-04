const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "ERROR_TOKEN_NOT_PROVIDED"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "ERROR_UNAUTHORIZED"
            });
        }
        req.userId = decoded.id;
        next();
    });
};

const authJwt = {
    verifyToken
};
module.exports = authJwt;