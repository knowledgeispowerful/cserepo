
/* *******************************************************
 * Required Modules and Dependencies
 *******************************************************/
// Third-party modules for core functionality
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Custom modules for project-specific needs
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require('./routes/accountRoute.js');
const messageRoute = require('./routes/messageRoute.js');
const intentionalErrorRoute = require("./routes/intentionalErrorRoute.js");
const utilities = require("./utilities/index.js");
const pool = require("./database");

/* *******************************************************
 * Application Initialization
 *******************************************************/
const app = express();
const env = require("dotenv").config();

/* *******************************************************
 * Middleware Setup
 * Includes sessions, request parsing, and security features
 *******************************************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
  })
);
// Request parsers
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
  extended: true
}));
// Cookie parsing for added flexibility
app.use(cookieParser())
// JWT token validation
app.use(utilities.checkJWTToken);


/* *******************************************************
 * Template Engine Configuration
 * Sets up view engine and layout templates
 *******************************************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at view root

// Core routes
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);
// Account routes
app.use("/account", accountRoute);
// Message routes
app.use("/message", messageRoute);
// Intentional error route. Used for testing
app.use("/ierror", intentionalErrorRoute);
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Unfortunately, we don\'t have that page in stock.'})
})

/* *******************************************************
 * Error Handling
 * Captures errors and serves user-friendly responses
 *******************************************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.dir(err);
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* *******************************************************
 * Server Configuration
 * Retrieves settings from .env file
 *******************************************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || '0.0.0.0';

/* *******************************************************
 * Server Initialization
 * Logs a confirmation message when the server is running
 *******************************************************/
app.listen(PORT, HOST, () => {
  console.log(`App listening on ${HOST}:${PORT}`);
});
