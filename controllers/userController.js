const { StatusCodes } = require("http-status-codes");

function register(req, res) {
  const newUser = { ...req.body }; // this makes a copy
  global.users.push(newUser);
  global.user_id = newUser; // After the registration step, the user is set to logged on.
  delete req.body.password;
  res.status(StatusCodes.CREATED).json(req.body);
}

function logon(req, res) {
  const foundUser = global.users.find((user) => user.email === req.body.email);

  if (foundUser) {
    if (foundUser.password === req.body.password) {
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
