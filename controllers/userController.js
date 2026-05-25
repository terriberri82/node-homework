const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const prisma = require("../db/prisma")

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
  value.hashedPassword = await hashPassword(value.password);
  delete value.password;
   try {
     user = await prisma.user.create({
    data: { name: value.name, email: value.email, hashedPassword: value.hashedPassword },
    select: { name: true, email: true, id: true} // specify the column values to return
  });
  } catch (err) {
  // the email might already be registered
  if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") { return res.status(400).json({
    message: "Email is already registered"
  })
  }else {
      return next(err); 
    }
}

  global.user_id = user.id; // After the registration step, the user is set to logged on.
  res.status(StatusCodes.CREATED).json({ name: user.name, email: user.email });
}

async function logon(req, res) {
  
  let { email, password } = req.body;
  email = email.toLowerCase() 
const user = await prisma.user.findUnique({ where: { email }});
  if (user === null) {
  return res.status(StatusCodes.NOT_FOUND).json({ message: "This account is not found" });
}
  const passwordMatch = await comparePassword(password, user.hashedPassword);
  if (!passwordMatch) {
  return res.status(StatusCodes.UNAUTHORIZED).json({ message: "The email and password you entered is unauthorized" });
}
global.user_id = user.id;
return res.status(StatusCodes.OK).json({ name: user.name, email: user.email });
}
function logoff(req, res) {
  global.user_id = null;
  return res.sendStatus(StatusCodes.OK);
}
module.exports = { register, logon, logoff };
