const express = require('express');
const app = express();
const { pool } = require("./dbConfing"); 
const bcrypt = require('bcrypt'); 
const bodyParser = require('body-parser');
var path = require('path'); 
require("dotenv").config();
const session = require('express-session'); 
const flash = require("express-flash"); 
const passport = require("passport");
const nodeMailer = require('nodemailer');
const multer = require("multer");
const ejs = require('ejs');
var request = require('request-promise');
const initializePassport = require("./passportConfig"); 
var result;
initializePassport(passport);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 4050; 

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true})); 
app.use(express.static(path.join(__dirname,'public'))); 

app.use(session({
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 
app.use(bodyParser.json());
app.use(session({ secret: 'secret', saveUninitialized: false, resave: false, cookie: { maxAge: 1000 } }));
app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/users/signup', checkAuthenticated, (req, res) => {
    res.render("signup.ejs");
});

app.get('/users/signupOrganizer', (req, res) =>{
    res.render("signupOrganizer.ejs");
});

app.get('/users/localPage',checkNotAuthenticated, (req, res) =>{
    const localeTitle = req.query.title;
    res.render("localPage",{ localeTitle});
});



app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get("/users/profile/review",checkNotAuthenticated, (req, res) => {
    res.render("review.ejs",{ user: req.user});
});

app.get("/profile/deleteReservation", (req,res) =>{
    // console.log(req.query.title);
    // console.log(req.query.surname);
    console.log("ok siamo dentro bello");
    pool.query(`
        DELETE FROM book
        WHERE name = $1 and surname = $2 and title = $3`, [req.query.name,req.query.surname,req.query.title], (err, results) => {
            if (err) throw err;
        }) 
        console.log("ok siamo fuori bello");
        return res.render("index");
})

app.get("/profile/getRole", (req, res) => {
    pool.query(`SELECT ruolo
                FROM users
                WHERE name = $1 and surname = $2`, [req.query.name, req.query.surname], (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                    console.log(JSON.stringify(results.rows));
                })
});

app.get("/profile/booking", (req,res) => {
    console.log(req.query.name);
    console.log(req.query.surname);
    pool.query(`SELECT *
                FROM book
                WHERE name = $1 and surname = $2`, [req.query.name, req.query.surname], (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                    console.log(JSON.stringify(results.rows));
                })
});


app.post('/users/signupOrganizer', async (req, res) =>{
    let role = "organizer";
    let {name, surname, CoName, coMail, CoRole, VatNumber, pass, passConf } = req.body; 
    
    let errors = []; 

    if (!name || !surname || !CoName || !coMail || !CoRole || !pass || !passConf){
        errors.push({message: "Please enter all fields"});
    }

    if (pass.length < 6){
        errors.push({message: "Password must be at least six characters"});
    }

    if (pass != passConf){
        errors.push({message: "Password do not match!!!"});
    }

    if (errors.length > 0){
        res.render("signupOrganizer", {errors})
    }else{
        // form validation passed 
        let hashedPassword = await bcrypt.hash(pass, 10); 
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM company
            WHERE comail = $1`, [coMail], (err, results) =>{
                if (err){
                    throw err;
                }
                console.log(results.rows);
                if (results.rows.length > 0){
                    errors.push({message: "Email already in use. "});
                    res.render('signupOrganizer', {errors}); 
                }else{
                    pool.query(
                        `INSERT INTO company (name, surname,coname, comail, corole, vatnumber, pass)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING vatnumber,pass`, [name, surname,CoName, coMail, CoRole, VatNumber,hashedPassword], (err, results) =>{
                            if(err){
                                throw err; 
                            }
                        }
                    )
                    pool.query(
                        `INSERT INTO users (name, surname, email, username, pw, ruolo)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING email,pw`, [name, surname, coMail, VatNumber,hashedPassword, role], (err, results) =>{
                            if(err){
                                throw err; 
                            }
                    
                            req.flash('success_msg', "You are now registered. Please log in. ");
                            res.redirect("/users/login");
                        }
                    )      
                }
            }
        )
    }
});


app.post('/profile/addToMap', (req, res) => {
    // Ottenere i dati dalla richiesta o dal database
    const name = req.body.organizerName;
    const surname = req.body.organizerSurname;
    const compName = req.body.companyName;
    const partyName = req.body.partyName;
    const date = req.body.partyDate;


    pool.query(
        `INSERT INTO party (nomeorg, cognomeorg, compnome, partyname, data)
        VALUES ($1, $2, $3, $4, $5)`, [name, surname, compName, partyName,date], (err, results) =>{
            if(err){
                throw err; 
            }
        }
    )

    res.render("map");
});

app.get('/profile/getParty', (req,res) => {
    pool.query(`SELECT *
                FROM party`, (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                    console.log(JSON.stringify(results.rows));
                })
});


app.post('/users/bookEn',(req, res) => {
    let {name, surname, title, table ,entries} = req.body;
    pool.query(`
        INSERT INTO book
        VALUES ($1,$2,$3,$4,$5)`, [name,title,surname,table,entries], (err, res) => {
            if (err) throw err;
    })
    res.redirect("/");
})


app.post("/users/profile/review", (req, res) => {
    const locale = req.body.locale;
    const recensione = req.body.recensione;

    if (recensione.length < 1){
        console.log("La recensione non può essere vuota");
    }
    else{

        pool.query(`
        INSERT INTO reviews
        VALUES ($1,$2,$3)`, [req.user.username,locale,recensione], (err, res) => {
            if (err) throw err;
        })

    }
    res.redirect('/users/profile');
});


app.get('/users/profile',checkNotAuthenticated, (req, res) =>{
    res.render("profile", { user: req.user.name, imgSrc: req.user.img_src, bio: req.user.bio, username: req.user.username, su: req.user.surname});
});

app.get('/users/editProfile',checkNotAuthenticated, (req, res) =>{
    res.render("editProfile",{ user: req.user });
});


app.get("/users/partners", checkNotAuthenticated, (req, res) => {
    const clubs = require('./public/jsonFiles/discoList.json');
    res.render("partners", { clubs });
});

app.get('/review/list/:name',checkNotAuthenticated, (req,res) => {
    var name = req.params.name == '0' ? req.user.username : req.params.name;
    pool.query(`SELECT *
                FROM reviews
                WHERE username = $1`, [name], (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                });
    
});

app.get('/socialNetwork', checkNotAuthenticated, (req,res) => {
    res.render('socialNetwork',{user: req.user});
});

app.post("/send_post", checkNotAuthenticated, upload.single('postImage'), (req,res) => {
    const post = req.body.posttext;
    const imgSrc = req.file ? req.file.originalname : null;

    pool.query(`
                INSERT INTO post (username, text, img_src)
                VALUES ($1, $2, $3)
                RETURNING *`, [req.user.username, post, imgSrc], (err,res) => {
                    if(err){
                        throw err; 
                    }
                });
    res.render('socialNetwork',{user: req.user});
});
app.get('/users/get_post/:name', checkNotAuthenticated, (req,res) => {
    var name = req.params.name == '0' ? req.user.username : req.params.name;
    pool.query(`
                SELECT *
                FROM post
                WHERE username = $1
                ORDER BY id DESC`,[name],(err, results) => {
                    if(err){
                        throw err; 
                    }
                    res.send(JSON.stringify(results.rows));
                });
});

app.get("/get_post",checkNotAuthenticated, (req,res) => {
    pool.query(`
                SELECT *
                FROM post
                ORDER BY id DESC`, (err, results) => {
                    if(err){
                        throw err; 
                    }
                    res.send(JSON.stringify(results.rows));
                });
})
app.post('/posts/:postId/delete', (req, res) => {
    const postId = req.params.postId;
    pool.query(`DELETE FROM post
                WHERE id = $1`, [postId], (err, results) => {
                    if (err) throw err;
                });
    pool.query(`DELETE FROM likes
                WHERE post_id = $1`, [postId], (err, results) => {
                    if (err) throw err;
                });
    
})
//aggiungere like ad un post
app.put("/posts/:postId/like", (req, res) => {
    const postId = req.params.postId;
    const value = req.body.value;

    pool.query(`UPDATE post
                SET likes = likes + $2
                WHERE id = $1
                RETURNING *`,[postId, value] , (err, result) => {
                    if (err)
                        throw err;
                     }
                );
    if (value > 0){
        pool.query(`INSERT INTO likes (username, post_id)
                    VALUES ($1, $2)`, [req.user.username, postId], (err,result) => {
                        if (err) throw err;
                    });
    } else{
        pool.query(`DELETE FROM likes
                    WHERE username = $1 and post_id = $2`, [req.user.username, postId],(err,result) => {
                        if (err) throw err;
                        }
                    );
    }
  });


app.get('/post/get_like',checkNotAuthenticated, (req,res) => {
    pool.query(`
                SELECT post_id
                FROM likes
                WHERE username = $1`, [req.user.username], (err, results) => {
                    if(err){
                        throw err; 
                    }
                    res.send(JSON.stringify(results.rows));
                });
});

//Invita gli amici
app.post("/send_email/friends", (req, res) =>{
    var _name = req.body.name;
    var _email = req.body.email;
    var _msg = req.body.message;

    let errors = []; 

    if (!_name || !_email){
        errors.push({message: "Please enter all fields"});
    }

    var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: _email,
        subject: `Hi ${_name}, you have been invited to Let's Party.`,
        html: `${_msg}`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            throw error;
        }
        else {
            console.log("email sent");
        }
        res.render("profile", { user: req.user.name, imgSrc: req.user.img_src, bio: req.user.bio, username: req.user.username, su: req.user.surname});
    })
});


app.post("/logout",(req, res) => {
    console.log("logout");
    try {
        req.logout(function(err) {
            if (err) return next(err); });
      } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).send('Error during logout');
      }
});
app.get('/users/profile/:username', (req, res) => {
    var utente = req.params.username;

    pool.query(
        `SELECT name, img_src, bio, username
        FROM users WHERE username = $1`, [utente], (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Internal server error');
            }
            if (result.rows.length === 0) {
                return res.status(404).send('User not found');
            }
            const userData = result.rows[0];

            const data = {
                user: userData.username,
                imgSrc: userData.img_src,
                bio: userData.bio
            };

            console.log("data", data);
            res.render('profile_public', data);
        }
    );
});
app.post("/users/deleteProfile", (req,res) => {
    pool.query(`
                DELETE FROM users 
                WHERE username = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                }
                );
    pool.query(`
                DELETE FROM fav 
                WHERE utente = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                }
                );
    pool.query(`
                DELETE FROM reviews 
                WHERE username = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                }
                );
    pool.query(`
                DELETE FROM likes
                WHERE username = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                }
                );
    pool.query(`
                DELETE FROM post 
                WHERE username = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                }
                );            
    req.session.destroy();
});


app.get('/users/map', checkNotAuthenticated, (req,res) => {
    res.render("map", { user: req.user.name });
})


app.get('/map-data', async (req, res) =>{
    var data = {
        lt: req.query.lt,
        lg: req.query.lg,
    };
    var options = {
        method: 'POST',
        // http:flaskserverurl:port/route
        uri: 'http://127.0.0.1:5000/createScrape',
        body: data,
  
        // Automatically stringifies
        // the body to JSON 
        json: true
    };

    var sendrequest = await request(options)
  
        // The parsedBody contains the data
        // sent back from the Flask server 
        .then(function (parsedBody) {
            console.log(parsedBody);
              
            // You can do something with
            // returned data
            
            result = parsedBody['result'];
            console.log(result);
        })
        .catch(function (err) {
            console.log(err);
        });
});



app.post('/users/signup', async (req, res) =>{
    let role = "utente";
    pool.query(`
    CREATE TABLE IF NOT EXISTS fav (utente VARCHAR NOT NULL, 
                                    title VARCHAR(100) NOT NULL,
                                    type VARCHAR(100) NOT NULL,
                                    address varchar (100),
                                    dist varchar(100) NOT NULL,
                                    phone varchar(100),
                                    website varchar(100),
                                    PRIMARY KEY(utente, title))`, (err, res) => {
        if(err){
            throw err; 
        }
    });

    let { name, surname, username, email, b_day, address, p_num, pw, pw_c } = req.body; 
    
    let errors = []; 

    if (!name || !surname || !username || !email || !b_day || !address || !p_num || !pw || !pw_c ){
        errors.push({message: "Please enter all fields"});
    }

    if (pw.length < 6){
        errors.push({message: "Password must be at least six characters"});
    }

    if (pw != pw_c){
        errors.push({message: "Password do not match!!!"});
    }

    if (errors.length > 0){
        res.render("signup", {errors})
    }else{
        // form validation passed 
        let hashedPassword = await bcrypt.hash(pw, 10); 
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) =>{
                if (err){
                    throw err;
                }
                console.log(results.rows);

                if (results.rows.length > 0){
                    errors.push({message: "Email already in use. "});
                    res.render('signup', {errors}); 
                }else{
                    pool.query(
                        `INSERT INTO users (name, surname, username, email, b_day, address, p_num, pw, ruolo)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )
                        RETURNING username,pw`, [name, surname, username, email, b_day, address, p_num, hashedPassword,role], (err, results) =>{
                            if(err){
                                throw err; 
                            }
                            req.flash('success_msg', "You are now registered. Please log in. ");
                            res.redirect("/users/login");
                        }
                    )
                }
            }
        )
    }
});


app.post('/users/login', passport.authenticate('local',{
    successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureFlash: true,
}));


app.get("/profile/list/:name", (req,res) => {
    var name = req.params.name == '0' ? req.user.username : req.params.name;
    pool.query(`SELECT *
                FROM fav
                WHERE utente = $1`, [name], (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                })
})

app.post('/users/map/update',(req, res) => {
    let {title, type, address, dist, phone, website} = req.body.card;
    //req.user è definito
    pool.query(`
        INSERT INTO fav
        VALUES ($1,$2,$3,$4,$5,$6,$7)`, [req.user.username,title,type,address,dist,phone,website], (err, res) => {
            if (err) throw err;
        })     
})

app.post('/review/list/update', (req,res) => {
    console.log(req.body);
    let username = req.body.username; 
    let title = req.body.title; 
    
    console.log(username);
    console.log(title);
    pool.query(`
        DELETE FROM reviews
        WHERE username = $2 and title = $1`,[title,username], (err,result) => {
            if (err) throw err;
        }
        );
    res.redirect('/users/profile');
});

app.post('/users/map/delete', (req,res) => {
    let {title, type, address, dist, phone, website} = req.body.card;
    pool.query(`
        DELETE FROM fav
        WHERE utente = $1 and title = $2`, [req.user.username,title], (err, res) => {
            if (err) throw err;
        }) 
})


app.post("/send_email", (req, res) =>{
    var _name = req.body.name;
    var _email = req.body.email;
    var _msg = req.body.message;

    if (!_name || !_email || !_msg){
        errors.push({message: "Please enter all fields"});
    }

    var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.DESTINATION,
        subject: `Message from ${_name}, ${_email}`,
        html: `${_msg}`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            throw error;
        }
        else {
            console.log("email sent");
        }
        res.redirect("/");
    })
})

app.post("/send_email", (req, res) =>{
    var _name = req.body.name;
    var _email = req.body.email;
    var _msg = req.body.message;

    var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.DESTINATION,
        subject: `Message from ${_name}, ${_email}`,
        html: `${_msg}`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            throw error;
        }
        else {
            console.log("email sent");
        }
        res.redirect("/");
    })
})


app.post('/users/editProfile', upload.single('profileImage'), (req, res) => {
    const { username, email, address, p_num, bio } = req.body;
    var oldMail = req.user.email;
    var imgSrc = req.file ? req.file.originalname : req.user.img_src;
    pool.query(`
                UPDATE users 
                SET username = $1, email = $2, address = $3, p_num = $4, bio = $5, img_src = $6
                WHERE name = $7 and surname = $8 and email = $9;
                `, [req.user.username, email, address, p_num, bio, imgSrc, req.user.name,req.user.surname, oldMail], (err, result) => {
      if (err) {
        console.error('Error in modify profile:', err.stack);
        res.status(500).send('Error in modify profile');
      }else{
        console.log("Good job");
        res.redirect("/");
      }
    });
})


app.post('/search-for-local', (req, res) =>{
    let search = req.body; 
    if (!search){
        res.redirect('/users/map');
    }
    res.redirect('/'); 

    
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/profile");
    }
    next();
}
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }


app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        // Dopo il login, reindirizza all'area riservata
        res.redirect("/users/profile");
    }
);


app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});
