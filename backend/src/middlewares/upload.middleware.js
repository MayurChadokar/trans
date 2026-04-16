const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Upload buffer to Cloudinary and return URL
 */
async function uploadToCloudinary(buffer, folder = "profiles") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = {
  upload,
  uploadToCloudinary
};
