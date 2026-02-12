const multer = require("multer");
// Store files in memory instead of disk
const storage = multer.memoryStorage();

// File filter: accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;