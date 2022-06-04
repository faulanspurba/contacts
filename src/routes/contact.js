const router = require("express").Router();
const { body } = require("express-validator");

const {
  contacts,
  create_contact,
  get_data_by_id,
  edit_contact,
  delete_contact,
} = require("../controllers/contact");

router.get("/contacts", contacts);
router.post(
  "/contact",
  [
    body("name").isLength({ min: 4 }).withMessage("Your Name is too short"),
    body("email")
      .isLength({ min: 10 })
      .withMessage("Minimum for email is 5 characters"),
  ],
  create_contact
);
router.get("/contact/:_id", get_data_by_id);
router.put("/contact/:_id", edit_contact);
router.delete("/contact/:_id", delete_contact);

module.exports = router;
