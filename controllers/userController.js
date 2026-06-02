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

  value.hashedPassword = await hashPassword(value.password);
  delete value.password;
  const { email, name, hashedPassword } = value;
   try {
  const result = await prisma.$transaction(async (tx) => {
    
    const newUser = await tx.user.create({
      data: { email, name, hashedPassword },
      select: { id: true, email: true, name: true }
    });

    
    const welcomeTaskData = [
      { title: "Complete your profile", userId: newUser.id, priority: "medium" },
      { title: "Add your first task", userId: newUser.id, priority: "high" },
      { title: "Explore the app", userId: newUser.id, priority: "low" }
    ];
    await tx.task.createMany({ data: welcomeTaskData });

    // Fetch the created tasks to return them
    const welcomeTasks = await tx.task.findMany({
      where: {
        userId: newUser.id,
        title: { in: welcomeTaskData.map(t => t.title) }
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        userId: true,
        priority: true
      }
    });

    return { user: newUser, welcomeTasks };
  });

  // Store the user ID globally for session management (not secure for production)
  global.user_id = result.user.id;
  
  res.status(201);
  res.json({
    user: result.user,
    welcomeTasks: result.welcomeTasks,
    transactionStatus: "success"
  });
  return;
} catch (err) {
  if (err.code === "P2002") {
    return res.status(400).json({ error: "Email already registered" });
  } else {
    return next(err); 
  }
}
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
