const localStrategy = require("passport-local").Strategy;
const AccountAdmin = require("../models/accountAdmin");

const initializePassport = (passport) => {
    passport.use('local-admin', new localStrategy(
        { usernameField: 'username' },
        async function (username, password, done) {
            try {
                const user = await AccountAdmin.findOne({ username: username });
                if (!user)
                    return done(null, false, { message: 'Account not found!' });
                if (!await user.isCorrectPassword(password))
                    return done(null, false, { message: 'Incorrect password!' });

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
            const user = await AccountAdmin.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

module.exports = initializePassport;
