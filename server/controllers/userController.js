// server/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../config/jwtMiddleware");

// SIGNUP
exports.signupUser = async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashed,
    });

    const token = signToken({ _id: user._id, email: user.email, name: user.name });

    res.json({ ...user._doc, token });
  } catch (err) {
    res.status(500).json({ message: "Failed to signup user" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ _id: user._id, email: user.email, name: user.name });

    res.json({ ...user._doc, token });
  } catch (err) {
    res.status(500).json({ message: "User login failed" });
  }
};

// GET USER DETAILS
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user info" });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
};
