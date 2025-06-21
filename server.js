const express = require('express');
const session = require('express-session');
const path = require('path');
const i18n = require('i18n');

const app = express();

// i18n configuration
i18n.configure({
  locales: ['en', 'fr', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'fr',
  queryParameter: 'lang',
  objectNotation: true
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use(i18n.init);

app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));

let users = [];
let themeColor = '#f0f0f0';

function requireAuth(req, res, next){
  if(!req.session.user){
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res)=>{
  res.render('index', {user:req.session.user, themeColor, lang:req.getLocale()});
});

app.get('/register', (req, res)=>{
  res.render('register', {themeColor, user:req.session.user, lang:req.getLocale()});
});

app.post('/register', (req, res)=>{
  const {username, password} = req.body;
  users.push({username, password});
  req.session.user = {username};
  res.redirect('/');
});

app.get('/login', (req, res)=>{
  res.render('login', {themeColor, user:req.session.user, lang:req.getLocale()});
});

app.post('/login', (req, res)=>{
  const {username, password} = req.body;
  const user = users.find(u=>u.username===username && u.password===password);
  if(user){
    req.session.user = {username};
    return res.redirect('/');
  }
  res.redirect('/login');
});

app.get('/logout', (req, res)=>{
  req.session.destroy(()=>{
    res.redirect('/');
  });
});

// Admin
app.get('/admin', requireAuth, (req, res)=>{
  res.render('admin', {themeColor, user:req.session.user, lang:req.getLocale()});
});

app.post('/admin/color', requireAuth, (req, res)=>{
  themeColor = req.body.color || themeColor;
  res.redirect('/admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log('Server started on', PORT);
});
