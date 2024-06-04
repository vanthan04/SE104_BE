const localStrategy = require("passport-local").Strategy;
const User = require("../models/User")
const passport = require("passport")

const initializePassport = (passport) => {
    passport.use('local', new localStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email: email });
                if (!user)
                    return done(null, false, { message: 'Tài khoản không tồn tại!' });

                if (!await user.isCorrectPassword(password))
                    return done(null, false, { message: 'Tài khoản hoặc mật khẩu chưa chính xác' });

                return done(null, user);
            } catch (error) {
                done(error);
            }
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(async function (id, done) {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

module.exports = initializePassport;
