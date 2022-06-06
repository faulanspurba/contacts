const { validationResult } = require("express-validator"),
  Contact = require("../models/contact"),
  path = require("path"),
  fs = require("fs");

exports.contacts = (req, res, next) => {
  const page = req.query.page || 1,
    per_page = 5;
  let total_contacts;

  Contact.find()
    .countDocuments()
    .then((contact) => {
      total_contacts = contact;
      return Contact.find()
        .skip((page - 1) * per_page)
        .limit(per_page);
    })
    .then((contacts) => {
      res.status(200).render("contact", {
        title: "Contacts",
        layout: "layouts/main",
        contacts,
        page,
        per_page,
        total_contacts,
        msg: req.flash("msg"),
      });
      // res.status(200).json({
      //   message: "Getting All Datas is success",
      //   data: contacts,
      //   page,
      //   per_page,
      //   total_contacts,
      // });
    })
    .catch((err) => next(err));
};

exports.add_contact_view = (req, res, next) => {
  res.status(200).render("add_data", {
    title: "Add Data",
    layout: "layouts/main",
  });
};

exports.create_contact = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // const err = new Error(`Something error in your input`);
    // err.status = 400;
    // err.data = errors.array();
    // throw err;

    res.render("add_data", {
      title: "Add Data",
      layout: "layouts/main",
      errors: errors.array(),
    });

    return;
  }

  if (!req.file) {
    const err = new Error(`Something error in your input`);
    err.status = 400;
    err.data = " Error pada bagian req.file";
    throw err;
  }

  const { name, email, phone_number } = req.body,
    image = req.file.filename;

  const contacts = new Contact({
    name,
    email,
    phone_number,
    image,
  });
  contacts
    .save()
    .then((result) => {
      req.flash("msg", `Adding ${result.name} was successful!`);
      res.status(201).redirect("contacts");
      // res.status(201).json({
      //   message: "Creating App is Success",
      //   data: result,
      // });
    })
    .catch((err) => console.log("err: ", err));
};

exports.get_data_by_id = (req, res, next) => {
  const _id = req.params._id;

  Contact.findById(_id)
    .then((contact) => {
      if (!contact) {
        const err = new Error("Contact is not found");
        err.status = 404;
        throw err;
      }

      res.status(200).json({
        message: "Contact data found",
        data: contact,
      });
    })
    .catch((err) => next(err));
};

exports.edit_contact = (req, res, next) => {
  const _id = req.params._id,
    { name, email, phone_number } = req.body,
    image = req.file.path;

  Contact.findById(_id)
    .then((contact) => {
      if (!contact) {
        const err = new Error("Contact data is not found");
        err.status = 404;
        throw err;
      }

      contact.name = name;
      contact.email = email;
      contact.phone_number = phone_number;
      contact.image = image;

      return contact.save();
    })
    .then((contact) => {
      res.status(200).json({
        message: "Update data is success",
        data: contact,
      });
    })
    .catch((err) => next(err));
};

exports.delete_contact = (req, res, next) => {
  const _id = req.params._id;

  Contact.findById(_id)
    .then((contact) => {
      removeImage(contact.image);

      return Contact.findByIdAndRemove(_id);
    })
    .then((contact) => {
      res.status(200).json({
        message: "Deleting data is success",
        data: contact,
      });
    })
    .catch((err) => next(err));

  const removeImage = (img) => {
    fs.unlink(path.join(`${__dirname}/../../image/${img}`), (err) =>
      console.log(err)
    );
  };
};
