const express = require("express"),
  app = express(),
  path = require("path"),
  mongoose = require("mongoose"),
  multer = require("multer");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

// SAVING THE IMAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype == "image/jpg" ||
  file.mimetype == "image/jpeg" ||
  file.mimetype == "image/png"
    ? cb(null, true)
    : cb(null, false);
};

app.use(multer({ storage, fileFilter }).single("image"));

// MODELS
const contact = require("./src/routes/contact");

// FLASH MESSAGE
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
// Konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {
      maxAge: 6000,
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    },
  })
);
app.use(flash());

app.use("/v1/user", contact);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message,
    data,
  });
});

mongoose
  .connect(
    "mongodb+srv://admin1:RM2D8gcD57lQO8Xu@cluster0.h8jyz.mongodb.net/Contact?retryWrites=true&w=majority"
  )
  .then(app.listen(3000, () => console.log("App is listening on port 3000")))
  .catch((err) => console.log(err));
