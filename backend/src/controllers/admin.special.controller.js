const SpecialUser = require("../models/SpecialUser");

/**
 * GET /api/admin/special
 */
async function listSpecialUsers(req, res, next) {
  try {
    const { target, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (target) filter.target = target;
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      SpecialUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SpecialUser.countDocuments(filter)
    ]);

    return res.json({ 
      success: true, 
      users,
      pagination: { total, page, limit }
    });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/admin/special
 */
async function createSpecialUser(req, res, next) {
  try {
    const { name, phone, role, target } = req.body;
    const user = await SpecialUser.create({
      name,
      phone,
      role,
      target
    });
    return res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/admin/special/:id
 */
async function updateSpecialUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await SpecialUser.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/special/:id
 */
async function deleteSpecialUser(req, res, next) {
  try {
    const { id } = req.params;
    await SpecialUser.findByIdAndDelete(id);
    return res.json({ success: true, message: "Special user deleted" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listSpecialUsers,
  createSpecialUser,
  updateSpecialUser,
  deleteSpecialUser
};
