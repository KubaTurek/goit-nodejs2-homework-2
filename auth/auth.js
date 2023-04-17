const jwt = require("jsonwebtoken");
const { getUserByEmail } = require("./../controllers/userController");

const jwtSecret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("No token provided");
  }
  try {
    jwt.verify(token, jwtSecret);
    req.user = jwt.decode(token);
    const user = await getUserByEmail(req.user.email);

    if (!user) {
      return res.status(401).json("Not authorized");
    }
    next();
  } catch {
    return res.status(401).send("Not authorized");
  }
};

module.exports = auth;
