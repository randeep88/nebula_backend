const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model.js");
const EmailVerification = require("../models/emailVerification.model.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "randeeprajpal9@gmail.com",
    pass: "wbnb wqha zoca cuwa",
  },
});

const register = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ msg: "Username and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists, try login" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "Profile picture is required" });
    }

    const newUser = await User.create({
      username,
      email,
      profilePic: req.file.path,
      isVerified: false,
    });

    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({
      msg: "Getting error in user registration",
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "User not verified" });
    }

    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const userUpdate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already in use" });
      }
      user.isVerified = false;
    }

    user.username = username || user.username;
    user.email = email || user.email;

    if (req.file) {
      user.profilePic = req.file.path;
    }

    await user.save();
    res.status(200).json({ msg: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    if (purpose === "login") {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "User does not exist, try to register first",
          success: false,
        });
      }
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true },
    );

    await transporter.sendMail({
      from: `Nebula <randeeprajpal9@gmail.com>`,
      to: email,
      subject: "Email Verification OTP for Nebula",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your OTP for Nebula verification is:</p>
          <h1 style="color: #00CDAC; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Your OTP is ${otp}. This OTP will expire in 5 minutes.`,
    });

    res.json({ message: `OTP sent to ${email}`, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
      success: false,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        msg: "OTP and email are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "User does not exist, try to register",
        success: false,
      });
    }

    const verifiedOTP = await EmailVerification.findOne({ otp, email });
    if (!verifiedOTP) {
      return res.status(400).json({
        msg: "Invalid OTP",
        success: false,
      });
    }

    if (verifiedOTP.expiresAt < Date.now()) {
      await EmailVerification.deleteOne({ email });
      return res.status(400).json({
        msg: "OTP expired",
        success: false,
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );

    await EmailVerification.deleteOne({ email });

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
      success: false,
    });
  }
};

module.exports = {
  login,
  register,
  me,
  userUpdate,
  sendOTP,
  verifyOtp,
};
