const bcrypt = require("bcryptjs");
const issueToken = require("./issueToken");

const { getUserByEmail } = require("./../controllers/userController");

const loginHandler = async (email, incomingPassword) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }
  const userPassword = user.password;
  const result = bcrypt.compareSync(incomingPassword, userPassword);
  if (result) {
    return issueToken(user);
  } else {
    throw new Error("Invalid login credentials");
  }
};

module.exports = { loginHandler };
