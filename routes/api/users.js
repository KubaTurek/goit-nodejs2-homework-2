const express = require("express");
const router = express.Router();
const { userValidationSchema } = require("./../../models/user");
const { loginHandler } = require("./../../auth/loginHandler");
const auth = require("./../../auth/auth");

const {
  createUser,
  getUserByEmail,
  logout,
} = require("./../../controllers/userController");

router.post("/signup", async (req, res) => {
  const { password, email } = req.body;
  const { error } = userValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await getUserByEmail(email);
  if (user) {
    return res.status(409).json({ messsage: "Email in use" });
  }
  try {
    const newUser = await createUser(password, email);
    res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json(error, "Something went wrong");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email or password missing");
  }
  try {
    const token = await loginHandler(email, password);
    return res.status(200).send(token);
  } catch (error) {
    return res.status(401).send(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await getUserByEmail(email);
    res.status(200).json(user);
  } catch (error) {
    next(error);
    return res.status(500).json("Server error");
  }
});

router.get("/logout", async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await logout(token);
    res.status(204).json(user);
  } catch (error) {
    next(error);
    return res.status(500).json("Server error");
  }
});

module.exports = router;
