const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const pool = require("../db/pg-pool");

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function register(req, res, next) {
  if (!req.body) req.body = {};
  const {error, value} = userSchema.validate(req.body, {abortEarly: false});
  
  if (error){
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
   let user = null;
  value.hashed_password = await hashPassword(value.password);
   try {
    user = await pool.query(`INSERT INTO users (email, name, hashed_password) 
      VALUES ($1, $2, $3) RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password]
    ); // note that you use a parameterized query
  } catch (e) {
  // the email might already be registered
  if (e.code === "23505") { return res.status(400).json({
    message: "Email is already registered"
  })
  }
  return next(e); // all other errors get passed to the error handler
}

  global.user_id = user.rows[0].id; // After the registration step, the user is set to logged on.
  res.status(StatusCodes.CREATED).json({ name: user.rows[0].name, email: user.rows[0].email });
}

async function logon(req, res) {
  
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  if (result.rows.length === 0) {
  return res.status(StatusCodes.NOT_FOUND).json({ message: "This account is not found" });
}
  const passwordMatch = await comparePassword(password, result.rows[0].hashed_password);
  if (!passwordMatch) {
  return res.status(StatusCodes.UNAUTHORIZED).json({ message: "The email and password you entered is unauthorized" });
}
global.user_id = result.rows[0].id;
return res.status(StatusCodes.OK).json({ name: result.rows[0].name, email: result.rows[0].email });
}
function logoff(req, res) {
  global.user_id = null;
  return res.sendStatus(StatusCodes.OK);
}
module.exports = { register, logon, logoff };
