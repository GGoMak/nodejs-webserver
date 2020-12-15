const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const dateFilter = require('nunjucks-date-filter');

// nunjucks date 포맷 설정
function setUpNunjucks(expressApp) {

  let env = nunjucks.configure('views', {
      autoescape: true,
      express: app
  });

  // note that 'date' is the function name you'll use in the template. As shown in nunjucks-date-filter's readme
  env.addFilter('date', dateFilter);
}

dotenv.config();
const webSocket = require('./socket');
const pageRouter = require('./routes/page')
const authRouter = require('./routes/auth');
const aboutRouter = require('./routes/about');
const boardRouter = require('./routes/board');
const galleryRouter = require('./routes/gallery');
const messageRouter = require('./routes/message');
const connect = require('./schemas');
const passportConfig = require('./passport');

const app = express();

passportConfig();
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
connect();
setUpNunjucks();

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/about', aboutRouter);
app.use('/board', boardRouter);
app.use('/gallery', galleryRouter);
app.use('/msg', messageRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});

webSocket(server, app, sessionMiddleware);