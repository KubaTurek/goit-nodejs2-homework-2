const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { userValidationSchema } = require("./../../models/user");
const { loginHandler } = require("./../../auth/loginHandler");
const auth = require("./../../auth/auth");

const {
  createUser,
  getUserByEmail,
  logout,
  updateAvatar,
} = require("./../../controllers/userController");

const storeAvatar = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeAvatar);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: 1048576,
});

const upload = multer({ storage });

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

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { email } = req.user;
      const { path: temporaryName, originalname } = req.file;
      const fileName = path.join(storeAvatar, originalname);
      await fs.rename(temporaryName, fileName);
      const image = await Jimp.read(fileName);
      await image.autocrop().cover(250, 250).quality(60).writeAsync(fileName);
      await fs.rename(
        fileName,
        path.join(process.cwd(), "public/avatars, originalname")
      );
      const avatarURL = path.join(
        process.cwd(),
        "public/avatars",
        originalname
      );
      const user = await updateAvatar(email, avatarURL);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
      return res.status(500).json("Server error");
    }
  }
);

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
