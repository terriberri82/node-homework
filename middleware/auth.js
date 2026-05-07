const {StatusCodes} = require("http-status-codes");

const authMiddleware = (req, res, next) => {
    if (global.user_id === null) {
        return res.status(StatusCodes.UNAUTHORIZED)
                  .json({message:"Unauthorized"})
    }
        next();
    
}

module.exports = authMiddleware;