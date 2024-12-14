require('dotenv').config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || 'localhost';

/* ***********************
 * Middleware
 *************************/
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./layouts/layout");

/* ***********************
 * Static Files
 *************************/
app.use(express.static(path.join(__dirname, "public")));

/* ***********************
 * Routes
 *************************/
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

/* ***********************
 * Start the Server
 *************************/
app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
