const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { pool } = require("./dbConfing"); 
const bcrypt = require("bcrypt"); 


function initialize(passport){
    const authenticateUser = (email, pw, done) =>{
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) =>{
                if (err){
                    throw err;
                }
                console.log(results.rows.length);
                if (results.rows.length > 0){
                    
                    const user = results.rows[0]; 
                    bcrypt.compare(pw, user.pw, (err, isMatch) =>{
                        if (err){
                            throw err;
                        }
                        if (isMatch){
                            return done(null, user); 
                        }else{
                            return done(null, false, {message: 'pw is not correct'}); 
                        }
                    });
                }else{
                    return done(null, false, {message: "Email is not registered"}); 
                }
            }
        )
    }

    const authenticateGoogleUser = (accessToken, refreshToken, profile, done) => {
        console.log("Google Profile:", profile);
        
        const googleEmail = profile.emails[0].value;
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [googleEmail], (err, results) => {
                if (err) {
                    return done(err);
                }
                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    return done(null, user);
                } else {
                    const { name, displayName, emails } = profile;
                    const givenName = name.givenName;
                    const familyName = name.familyName;
                    pool.query(
                        `INSERT INTO users (name, surname, username, email)
                        VALUES ($1, $2, $3, $4) RETURNING *`,
                        [givenName, familyName, displayName, emails[0].value], (insertErr, newUser) => {
                            if (insertErr) {
                                return done(insertErr);
                            }
                            return done(null, newUser.rows[0]);
                        }
                    )
                }
            }
        );
    }

    passport.use(new LocalStrategy({
        usernameField: "email", 
        pwField: "pw"
        },
        authenticateUser
        )
    );
    
    passport.use(new GoogleStrategy({
        clientID: "",
        clientSecret: "",
        callbackURL: "http://localhost:4050/auth/google/callback"
        },
        authenticateGoogleUser
        )
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) =>{
        if (user.name) {
            pool.query(
                `SELECT * FROM users
                WHERE name = $1 `, [user.name], (err, results)=>{
                    if (err){
                        throw err; 
                    }
                    return done(null, results.rows[0]); 
                }
            )
        } else {
            done(null, user);
        }
    })
}

module.exports = initialize; 