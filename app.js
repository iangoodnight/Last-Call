const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const compression = require('compression');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/auth');

const app = express();

// Set up mongoose connection
const mongoose = require('mongoose');
const dev_db_url = encodeURI(process.env.DEV_DB_URL);
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, {
	// auth: {
	// 	authdb: "admin",
	// 	user: process.env.MONGO_DB_USER,
	// 	password: encodeURI(process.env.MONGO_DB_PASSWORD)
	// },
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false 
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connections error: '));
db.once('open', () => {
	console.log('\nSuccessfully connected to Mongo!\n');
})

const exphbs = require('express-handlebars');
// view engine setup
app.engine('hbs', exphbs({
	extname: 'hbs', 
	defaultLayout: 'main',
	partialsDir: __dirname + '/views/partials/',
  	helpers:{
    	// Function to do basic mathematical operation in handlebar
    	math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
        	rvalue = parseFloat(rvalue);
        	return {
            	"+": lvalue + rvalue,
            	"-": lvalue - rvalue,
            	"*": lvalue * rvalue,
            	"/": lvalue / rvalue,
            	"%": lvalue % rvalue
        	}[operator];
    	}
    }
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});
app.use(helmet());
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

// Require our routes
const routes = require("./routes");

// Have every request go through our route middleware
app.use(routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
