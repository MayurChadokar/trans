const SoftwarePlan = require("../models/SoftwarePlan");

/**
 * GET /api/admin/plans
 */
async function listPlans(req, res, next) {
  try {
    const { target } = req.query;
    const filter = {};
    if (target) filter.target = target;
    
    const plans = await SoftwarePlan.find(filter).sort({ price: 1 });
    return res.json({ success: true, plans });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/admin/plans
 */
async function createPlan(req, res, next) {
  try {
    const { name, interval, price, features, target, allowedVehicles } = req.body;
    const plan = await SoftwarePlan.create({
      name,
      interval,
      price: Number(price),
      features,
      allowedVehicles: Number(allowedVehicles || 0),
      target: target || 'transport'
    });
    return res.json({ success: true, plan });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/admin/plans/:id
 */
async function updatePlan(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await SoftwarePlan.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, plan });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/admin/plans/:id
 */
async function deletePlan(req, res, next) {
  try {
    const { id } = req.params;
    await SoftwarePlan.findByIdAndDelete(id);
    return res.json({ success: true, message: "Plan deleted" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan
};
