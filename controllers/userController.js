const { User, hashPassword } = require("./../models/user");

const createUser = async (password, email) => {
  const hashedPassword = hashPassword(password);

  const user = new User({ password: hashedPassword, email });
  user.save();
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const logout = async (token) => {
  const user = await User.findOneAndUpdate({ token });
  return user;
};

module.exports = {
  createUser,
  getUserByEmail,
  logout,
};
