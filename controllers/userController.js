const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

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

async function register(req, res) {
  if (!req.body) req.body = {};
  const {error, value} = userSchema.validate(req.body, {abortEarly: false});
  if (error){
    return res.status(StatusCodes.BAD_REQUEST).json({message:error.message})
  }

  const hashedPassword = await hashPassword(value.password);
  const newUser = { name: value.name, email: value.email, hashedPassword };
  global.users.push(newUser);
  global.user_id = newUser; // After the registration step, the user is set to logged on.
  res.status(StatusCodes.CREATED).json({ name: newUser.name, email: newUser.email });
}

async function logon(req, res) {
  const foundUser = global.users.find((user) => user.email === req.body.email);

  if (foundUser) {
    const passwordMatch = await comparePassword(req.body.password, foundUser.hashedPassword);
      if (passwordMatch){
      global.user_id = foundUser;
      return res
        .status(StatusCodes.OK)
        .json({ name: foundUser.name, email: foundUser.email });
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({
          message: "The email and password you entered is unauthorized",
        });
    }
  }
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "This account is not found" });
}
function logoff(req, res) {
  global.user_id = null;
  return res.sendStatus(StatusCodes.OK);
}
module.exports = { register, logon, logoff };
