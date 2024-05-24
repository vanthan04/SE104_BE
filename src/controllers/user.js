const asyncHandler = require("express-async-handler");
const initializePassport = require("../middlewares/passport");
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
const User = require("../models/User");
const crypto = require('crypto');
const sendmail = require("../helps/sendEmail")

initializePassport(passport);

const register = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  const user = new User({
    fullname,
    email,
    password,
    emailToken: crypto.randomBytes(64).toString("hex"),
    verified: false,
  });

  if (!email || !password || !fullname)
    return res.status(400).json({
      success: false,
      message: "Missing inputs!",
    });

  sendmail.sendmail(user.email,
    "Verify your email",
    `<h2>Hello ${user.fullname}! Thank you for registering on our website!</h2>
          <h4>To activate your account, please <a href="http://${req.headers.host}/api/user/verify-email?token=${user.emailToken}">click here</a></h4>        
    `);

  const findEmail = await User.findOne({ email });

  if (findEmail) throw new Error("Email đã tồn tại!");
  else {
    const newUser = await user.save();
    return res.status(200).json({
      success: newUser ? true : false,
      message: newUser
        ? "Đăng kí thành công. Vui lòng kiểm tra email để xác thực!"
        : "Email đã tồn tại!",
    });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ emailToken: token });

  if (!user) {
    // Handle the case where the user with the provided token is not found
    return res.status(404).send(`
      <html>
        <head>
          <title>Email Verification Failed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .content {
              text-align: center;
              border: 2px solid #ccc; /* Thêm border 2px với màu xám nhạt */
              padding: 20px; /* Thêm padding để tạo khoảng cách từ border đến nội dung */
              border-radius: 10px; /* Thêm border-radius để bo tròn các góc */
            }
            h1 {
              color: red;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <h1>Email verification failed</h1>
            <p>Invalid token.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Update user's verification status
  user.verified = true;
  user.emailToken = undefined; // Clear the emailToken

  await user.save();

  // Respond with an HTML page indicating successful verification
  res.status(200).send(`
  <html>
    <head>
      <title>Email Verification Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .content {
          text-align: center;
          border: 2px solid #ccc; /* Thêm border 2px với màu xám nhạt */
          padding: 20px; /* Thêm padding để tạo khoảng cách từ border đến nội dung */
          border-radius: 10px; /* Thêm border-radius để bo tròn các góc */
        }
        h1 {
          color: green;
        }
      </style>
    </head>
    <body>
      <div class="content">
        <h1>Email Verification Successful</h1>
        <p>Your email has been successfully verified. You can now log in to your account.</p>
      </div>
    </body>
  </html>
`);
});


const login = asyncHandler (async (req, res, next) => {
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
      
      if (!user.verified) {
        return res.status(400).json({
          success: false,
          message: "Account is not verified, please verify email!"
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
  login,
  register,
  verifyEmail
};
