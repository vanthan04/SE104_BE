require("dotenv").config();
const asyncHandler = require("express-async-handler");
const initializePassport = require("../middlewares/passport");
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
const User = require("../models/User");
const crypto = require('crypto');
const sendmail = require("../helps/sendEmail");
const jwt = require("jsonwebtoken");
const { generateRandom } = require("../helps/generateRandom");
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



  const findEmail = await User.findOne({ email });

  if (findEmail) throw new Error("Email đã tồn tại!");
  else {
    sendmail.sendmail(user.email,
      "Verify your email",
      `<h2>Hello ${user.fullname}! Thank you for registering on our website!</h2>
            <h4>To activate your account, please <a href="http://${req.headers.host}/api/user/verify-email?token=${user.emailToken}">click here</a></h4>        
      `);
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
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err) {
        // throw err;
        return res.status(400).json({
          success: false,
          message: "Lỗi!"
        })
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: info.message || "Lỗi xác thực người dùng!",
        });
      }
      
      if (!user.verified) {
        return res.status(400).json({
          success: false,
          message: "Tài khoản chưa được xác minh. Vui lòng xác minh email!"
        });
      }
      req.login(user, async (err) => {
        if (err) {
          // throw err;
          return res.status(400).json({
            success: false,
            message: "Lỗi xác minh"
          })
        }

        const { password, refreshToken, ...data } = user.toObject();
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        
        // Update refresh token in the database
        const updatedUser = await User.findByIdAndUpdate(
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
          expiresAt: 30,
          data,
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  const password = generateRandom.generateRandom(6);

  if (user) {

    sendmail.sendmail(user.email,
      "Forget your password",
      `<h2>Hello ${user.fullname}!</h2>
          <h3>You have just requested a password reset for our website.</h3>
          <h4>Your new password is: ${password}</h4>`);

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password mới đã được gửi vào email. Vui lòng check email!",
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "Email không tồn tại!",
    });
  }
};


const getRefreshToken = async (req, res) => {
  try {
    const refreshtoken = req.cookies.refreshToken;
    if (!refreshtoken){
      return res.status(401).json({
        success: false,
        message: `Bạn cần phải xác thực!`
      })
    }
    jwt.verify(refreshtoken, process.env.JWT_SECRET,(err,user)=>{
      if(err) return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ!'
      })
      const accessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.cookie("refreshToken", newRefreshToken, {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }); 
      return res.status(200).json({
        success: true,
        accessToken,
        expiresAt: 30
      })
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error!'
    });
  }
  
}

const resetPassword = async (req, res) => {
  const { _id } = req.user;

  const { password, newpassword } = req.body;

  if (!_id || !password || !newpassword) {
    return res.status(400).json({
      success: false,
      message: "Thiếu dữ liệu",
    });
  }

  const user = await User.findById(_id);

  if (user) {
    if (await user.isCorrectPassword(password)) {
      user.password = newpassword;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Thay đổi mật khẩu thành công!",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Mật khẩu cũ chưa đúng!",
      });
    }
  }
};
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findById(_id).select("-refreshToken -password");

  return res.status(200).json({
    success: user ? true : false,
    userData: user ? user : "Tài khoản không tồn tại",
  });
});

module.exports = {
  login,
  register,
  verifyEmail,
  getRefreshToken,
  forgetPassword,
  resetPassword,
  getCurrent
};
