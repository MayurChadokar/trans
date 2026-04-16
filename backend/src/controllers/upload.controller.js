const { cloudinary } = require("../config/cloudinary");

function sanitizeFolder(input) {
  const raw = String(input || "trans").trim() || "trans";
  // allow only letters/numbers/_-/ and forward slashes, collapse multiple slashes
  const cleaned = raw
    .replace(/\\/g, "/")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
  return cleaned || "trans";
}

function inferResourceTypeFromMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  // PDFs should be uploaded as raw to avoid transformations issues.
  if (m === "application/pdf") return "raw";
  return "auto";
}

function toDataUri(file) {
  // multer memory storage provides buffer
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

async function uploadSingle(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const folder = sanitizeFolder(req.body?.folder);
    const resourceType = inferResourceTypeFromMime(file.mimetype);

    const result = await cloudinary.uploader.upload(toDataUri(file), {
      folder,
      resource_type: resourceType,
    });

    return res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      bytes: result.bytes,
      format: result.format,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
    });
  } catch (e) {
    return next(e);
  }
}

async function deleteFile(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (e) {
    console.error("[CLOUDINARY] Delete Failed:", e.message);
    throw e;
  }
}

module.exports = { uploadSingle, deleteFile };

