const { User, hashPassword } = require("./../models/user");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");

const createUser = async (body) => {
  const { email, password } = body;
  const avatarURL = gravatar.url(email, { s: "250" });
  const hashedPassword = hashPassword(password);
  const user = await User.create({
    password: hashedPassword,
    email,
    avatarURL,
    verify: false,
    verificationToken: uuidv4(),
  });
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

const verifyUser = async (verificationToken) => {
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verify: true, verificationToken: null },
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
  verifyUser,
};
