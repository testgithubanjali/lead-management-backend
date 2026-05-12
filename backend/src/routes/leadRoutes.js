const express = require("express");
const router = express.Router();
const {
  getAllLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLeadStatus,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const { validateCreateLead, validateStatusUpdate } = require("../middleware/validate");

// Dashboard stats
router.get("/stats", getLeadStats);

// Lead CRUD
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.post("/", validateCreateLead, createLead);
router.put("/:id", updateLead);
router.patch("/:id/status", validateStatusUpdate, updateLeadStatus);
router.delete("/:id", deleteLead);

module.exports = router;
