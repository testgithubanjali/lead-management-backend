const pool = require("../config/db");

// ─────────────────────────────────────────
// GET /api/leads — Get all leads
// ─────────────────────────────────────────
const getAllLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      source,
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const allowedSort = [
      "name",
      "created_at",
      "updated_at",
      "status",
      "source",
    ];

    const allowedOrder = ["ASC", "DESC"];

    const safeSort = allowedSort.includes(sort)
      ? sort
      : "created_at";

    const safeOrder = allowedOrder.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "DESC";

    let query = "SELECT * FROM public.leads WHERE 1=1";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (source) {
      params.push(source);
      query += ` AND source = $${params.length}`;
    }

    query += ` ORDER BY ${safeSort} ${safeOrder}`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// GET /api/leads/stats
// ─────────────────────────────────────────
const getLeadStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Interested') AS interested,
        COUNT(*) FILTER (WHERE status = 'Not Interested') AS not_interested,
        COUNT(*) FILTER (WHERE status = 'Converted') AS converted,
        COUNT(*) FILTER (WHERE source = 'Call') AS from_call,
        COUNT(*) FILTER (WHERE source = 'WhatsApp') AS from_whatsapp,
        COUNT(*) FILTER (WHERE source = 'Field') AS from_field,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS this_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS this_month
      FROM public.leads
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    const conversionRate =
      stats.total > 0
        ? ((stats.converted / stats.total) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        conversion_rate: parseFloat(conversionRate),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// GET /api/leads/:id
// ─────────────────────────────────────────
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM public.leads WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching lead:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// POST /api/leads
// ─────────────────────────────────────────
const createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      source,
      status = "Interested",
      notes = "",
    } = req.body;

    const existing = await pool.query(
      "SELECT id FROM public.leads WHERE phone = $1",
      [phone]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A lead with this phone number already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.leads
      (name, phone, source, status, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        name?.trim(),
        phone?.trim(),
        source,
        status,
        notes,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Lead added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating lead:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// PATCH /api/leads/:id/status
// ─────────────────────────────────────────
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      "Interested",
      "Not Interested",
      "Converted",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    let query = `
      UPDATE public.leads
      SET status = $1
    `;

    const params = [status];

    if (notes !== undefined) {
      params.push(notes);
      query += `, notes = $${params.length}`;
    }

    params.push(id);

    query += `
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating lead:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lead status",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// PUT /api/leads/:id
// ─────────────────────────────────────────
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      source,
      status,
      notes,
    } = req.body;

    if (phone) {
      const existing = await pool.query(
        `
        SELECT id
        FROM public.leads
        WHERE phone = $1 AND id != $2
        `,
        [phone, id]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Phone number already used by another lead",
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE public.leads
      SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        source = COALESCE($3, source),
        status = COALESCE($4, status),
        notes = COALESCE($5, notes)
      WHERE id = $6
      RETURNING *
      `,
      [name, phone, source, status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating lead:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// DELETE /api/leads/:id
// ─────────────────────────────────────────
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM public.leads
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting lead:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error.message,
    });
  }
};

module.exports = {
  getAllLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLeadStatus,
  updateLead,
  deleteLead,
};