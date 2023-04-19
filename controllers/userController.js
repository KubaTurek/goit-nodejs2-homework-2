const { User, hashPassword } = require("./../models/user");
const gravatar = require("gravatar");

const createUser = async (password, email) => {
  const hashedPassword = hashPassword(password);
  const avatarURL = gravatar.url(email, { s: "250" });

  const user = new User({ password: hashedPassword, email, avatarURL });
  user.save();
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const updateAvatar = async (email, avatarURL) => {
  const user = await User.findOneAndUpdate(
    { email },
    { avatarURL },
    { new: true }
  );
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
  updateAvatar,
};
