const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const ejs = require('ejs');
const app = express();

const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'RESTAURANT'
});

connection.connect((err)=>{
    if(err){
        throw err;
    }
    console.log('COnnected to database');
});

// connection.query('SHOW TABLES', (err, res)=>{
//     if(err) throw err;
//     console.log(res);
// });

const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');

app.set('port', process.env.PORT || port);
app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(publicDirectoryPath));

app.get('',(req, res)=>{
    res.render('welcome', {
        title: 'welcome'
    });
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.post('/auth', (req, res)=>{
    var email = req.body.email;
    var password = req.body.password;
    if(email && password){
        connection.query('SELECT * FROM user WHERE email_id = ? AND password = ?', [email, password], (err, result)=>{
            if(result.length > 0){
                req.session.loggedin = true;
                req.session.results = result;
                console.log(result);
                connection.query('DELETE FROM active_user', (e, ress)=>{
                    if(e){
                        res.send({error: "something wrong in deleting"});
                    }else{
                        connection.query('INSERT INTO active_user VALUES (?, ?, ?, ?, ?, ?)', [result[0].name, result[0].email_id, result[0].password, result[0].connect_no, result[0].latitude_1, result[0].longitude_1], (er, r)=>{
                            if(er){
                                res.send({error: "error in inserting the values in active users"});
                            }else{
                                console.log
                                res.redirect('/home');
                            }
                        });
                    }
                });
            }else{
                res.send("Incorrect email or password");
            }
        });
    }else{
        res.send('Please enter Email and Password!!');
    }

});

app.post('/registration', (req, res)=>{
    ({name, email, password, contact, latitude, longitude} = req.body);
    if(name && email && contact && latitude && longitude){
        if(password.length > 6){
            console.log("databse");
            connection.query('Insert INTO user VALUES (?, ?, ?, ?, ?, ?)', [name, email, password, contact, latitude, longitude], (err, result)=>{
                if(err){
                    res.send({error: err.sqlMessage});
                }else{
                    console.log(result);
                }
            });
        }else{
            res.send({error : "password should be more than 6 characters"});
        }
    }else{
        res.send({error : "make sure to fill every field"});
    }
});

app.post('/query', (req, res)=>{
    connection.query(req.body.searchquery, (err, result)=>{
        // console.log(result);
        res.render('home', {obj : result});
    });
})

app.get('/details', (req, res)=>{
    console.log(res.body);
    connection.query("SELECT * FROM restaurants", (err, result)=>{
        if(err){
            res.send({error : err});
        }else{
            res.render('details', {obj: result});
        }
    });
});

app.post('/details', (req, res)=>{
    console.log(req.body);
});

app.get('/auth', (req, res)=>{
    console.log(res.body);
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.get('/home', (req, res)=>{
    if(req.session.loggedin){
        var obj = [];
        res.render('home', {obj: obj});
    }
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});