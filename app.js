require('dotenv').config();

const createError = require('http-errors');
const debug = require('debug')('customers:db');
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const helmet = require('helmet');
const User = require('./models/user');
const {db_url} = require('./config/db')

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const customerRouter = require('./routes/customers');
const registerRouter = require('./routes/register');
const resendRouter = require('./routes/resend');
const validateRouter = require('./routes/validate');

const app = express();

// Connect to db
mongoose.connect(db_url || process.env.DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  debug('Connected to MongoDB');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(helmet());

app.use(session({
  secret: 'its a secret',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.title = 'Tech Access';
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.use('/auth', authRouter);
app.use('/customers', customerRouter);
app.use('/register', registerRouter);
app.use('/resend', resendRouter);
app.use('/validate', validateRouter);
/* 
  Keep the index view at the bottom because
  it has the catch all for telling the user
  the page does not exist
*/
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err.stack);
  req.flash('error', err.message);
  res.redirect('/');
});

// module.exports = app;

const port = process.env.PORT || 3000;

app.listen(port, function() {
  debug("Customers!");
});