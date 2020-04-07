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
            }
        });
    }

});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});