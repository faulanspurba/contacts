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
      const total_pages = Math.ceil(total_contacts / per_page);
      res.status(200).render("contact", {
        title: "Contacts",
        layout: "layouts/main",
        contacts,
        page,
        per_page,
        total_contacts,
        total_pages,
        msg: req.flash("msg"),
      });
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
    res.render("add_data", {
      title: "Add Data",
      layout: "layouts/main",
      errors: errors.array(),
    });
  } else {
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
      .then((contact) => {
        req.flash("msg", `Adding ${contact.name} was successful!`);
        res.status(201).redirect("contacts");
      })
      .catch((err) => console.log("err: ", err));
  }
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

      res.status(200).render("edit_data", {
        title: "Edit Data",
        layout: "layouts/main",
        contact,
      });
    })
    .catch((err) => next(err));
};

exports.edit_contact = (req, res, next) => {
  const errors = validationResult(req);

  const _id = req.params._id,
    { name, email, phone_number } = req.body,
    image = req.file.filename;

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
      req.flash("msg", `Changing ${contact.name} was successful!`);
      res.status(200).redirect("/v1/user/contacts");
      // res.status(200).json({
      //   message: "Update data is success",
      //   data: contact,
      //   errors: errors.array(),
      // });
    })
    .catch((err) => next(err));
};

exports.delete_contact = (req, res, next) => {
  const _id = req.params._id;

  Contact.findById(_id)

    .then((contact) => {
      fs.unlink(
        path.join(`${__dirname}/../../images/${contact.image}`),
        (err) => console.log(err)
      );

      return Contact.findByIdAndRemove(_id);
    })
    .then((contact) => {
      req.flash("msg", "Deleting Contact was Successful");
      res.status(200).redirect("/v1/user/contacts");
    })
    .catch((err) => next(err));
};
