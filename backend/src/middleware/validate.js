const { body, validationResult } = require("express-validator");

// Validate lead creation body
const validateCreateLead = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[+\d\s\-().]{7,20}$/).withMessage("Invalid phone number format"),

  body("source")
    .notEmpty().withMessage("Source is required")
    .isIn(["Call", "WhatsApp", "Field"]).withMessage("Source must be Call, WhatsApp, or Field"),

  body("status")
    .optional()
    .isIn(["Interested", "Not Interested", "Converted"])
    .withMessage("Status must be Interested, Not Interested, or Converted"),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes must be under 500 characters"),

  handleValidationErrors,
];

// Validate status update body
const validateStatusUpdate = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["Interested", "Not Interested", "Converted"])
    .withMessage("Status must be Interested, Not Interested, or Converted"),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes must be under 500 characters"),

  handleValidationErrors,
];

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validateCreateLead, validateStatusUpdate };
