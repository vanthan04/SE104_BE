const localStrategy = require("passport-local").Strategy;
const AccountAdmins = require("../models/accountAdmin")
const passport = require("passport")

const initializePassport = (passport) => {
    passport.use('local-admin', new localStrategy(
        { usernameField: 'username' },
        async (username, password, done) => {
            try {
                const user = await AccountAdmins.findOne({ username: username });
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
            const user = await AccountAdmins.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

module.exports = initializePassport;
