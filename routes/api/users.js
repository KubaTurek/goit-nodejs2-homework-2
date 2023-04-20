const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const { userValidationSchema } = require("./../../models/user");
const { loginHandler } = require("./../../auth/loginHandler");
const auth = require("./../../auth/auth");

const {
  createUser,
  getUserByEmail,
  logout,
  updateAvatar,
  verifyUser,
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

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (user) {
      return res.status(409).json({ messsage: "Email in use" });
    }

    const newUser = await createUser(req.body);

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PASS,
      },
    });

    const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 350px; background-color: #d4cece; font-size: 1.5rem;">
    <h1>Verification</h1>
    <p>Click on the link to verify your account</p>
    <a href='http://localhost:3000/api/users/verify/${newUser.verificationToken}' target='_blank'>Verify</a>
    </div>`;

    const emailOptions = {
      from: '"Jakub" <Jakub@test.pl>',
      to: [`${email}`],
      subject: "Verification email",
      text: "Mail to verify the account",
      html,
    };
    await transporter.sendMail(emailOptions);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
    return res.status(500).json("Something went wrong");
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
        path.join(process.cwd(), "public/avatars", originalname)
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

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PASS,
      },
    });

    const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 350px; background-color: #d4cece; font-size: 1.5rem;">
    <h1>Verification</h1>
    <p>Click on the link to verify your account</p>
    <a href='http://localhost:3000/api/users/verify/${user.verificationToken}' target='_blank'>Verify</a>
    </div>`;

    const emailOptions = {
      from: '"Jakub" <Jakub@test.pl>',
      to: [`${email}`],
      subject: "Verification email",
      text: "Mail to verify the account",
      html,
    };

    await transporter.sendMail(emailOptions);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await verifyUser(verificationToken);
    if (user) {
      return res.status(200).json({ message: "Verification successful" });
    } else return res.status(404).json({ message: "User not found" });
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
