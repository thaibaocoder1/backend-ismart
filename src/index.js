const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const routes = require('./routes');
const dotenv = require('dotenv');
dotenv.config();

// Start app
const app = express();
// Connect database
db.connect();
// Setup cors
const corsOptions = {
  origin: 'https://ismart-fullstack.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
// Environment variables
const port = process.env.PORT || 3000;
// Middleware
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header(
    'Access-Control-Allow-Origin',
    'https://ismart-fullstack.vercel.app',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(methodOverride('_method'));
// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Routes;
routes(app);
// Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
