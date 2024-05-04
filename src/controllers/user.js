const asyncHandler = require("express-async-handler");
const initializePassport = require("../middlewares/passport");
const passport = require("passport");
const AccountAdmins = require("../models/accountAdmin");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");

initializePassport(passport);

const loginAdmin = asyncHandler (async (req, res, next) => {
  passport.authenticate("local-admin", async (err, user, info) => {
    try {
      if (err) {
        // throw err;
        return res.status(400).json({
          success: false,
          message: "Failed"
        })
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: info.message || "Authentication failed",
        });
      }

      req.login(user, async (err) => {
        if (err) {
          // throw err;
          return res.status(400).json({
            success: false,
            message: "Failed"
          })
        }

        const { password, refreshToken, ...data } = user.toObject();
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        
        // Update refresh token in the database
        const updatedUser = await AccountAdmins.findByIdAndUpdate(
          user._id,
          { refreshToken: newRefreshToken },
          { new: true }
        );

        // Set refresh token in cookie
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          success: true,
          accessToken,
          data,
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = {
  loginAdmin,
};
