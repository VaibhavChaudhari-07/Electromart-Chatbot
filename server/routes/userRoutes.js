// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  updateUser,
  getUserInfo,
} = require("../controllers/userController");

const { authUser } = require("../config/jwtMiddleware");

// AUTH
router.post("/signup", signupUser);
router.post("/login", loginUser);

// USER DETAILS
router.get("/:id", authUser, getUserInfo);

router.put("/update/:id", authUser, updateUser);

module.exports = router;
