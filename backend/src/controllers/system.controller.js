const SystemSetting = require('../models/SystemSetting');

async function getBanners(req, res, next) {
  try {
    const setting = await SystemSetting.findOne({ key: 'global_banners' });
    return res.json({ success: true, banners: setting ? setting.value : [] });
  } catch (e) {
    next(e);
  }
}

async function updateBanners(req, res, next) {
  try {
    const { banners } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'global_banners' },
      { value: banners },
      { upsert: true, new: true }
    );
    return res.json({ success: true, banners: setting.value });
  } catch (e) {
    next(e);
  }
}

module.exports = { getBanners, updateBanners };
