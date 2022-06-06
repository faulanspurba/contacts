const router = require("express").Router();
const { body, check } = require("express-validator");

const {
  contacts,
  add_contact_view,
  create_contact,
  get_data_by_id,
  edit_contact,
  delete_contact,
} = require("../controllers/contact");

router.get("/contacts", contacts);
router.get("/add-contact", add_contact_view);
router.post(
  "/contact",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Minimum 3 characters for name"),
    body("email")
      .isLength({ min: 5 })
      .withMessage("Minumum 5 characters for email"),
  ],
  create_contact
);
router.get("/contact/:_id", get_data_by_id);
router.put("/contact/:_id", edit_contact);
router.delete("/contact/:_id", delete_contact);

module.exports = router;
