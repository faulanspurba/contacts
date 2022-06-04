const app = require("express")();
const mongoose = require("mongoose");
const multer = require("multer");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const ejs = require("ejs"),
  expressejslayouts = require("express-ejs-layouts");

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

const contact = require("./src/routes/contact");

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
    "mongodb+srv://Contact-App:E28udskg7bG9Vyx8@cluster0.7y59w.mongodb.net/Contact?retryWrites=true&w=majority"
  )
  .then(app.listen(3000, () => console.log("App is listening on port 3000")))
  .catch((err) => console.log(err));
