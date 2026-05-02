const multer = require("multer");

// Use memory storage so files don’t get saved locally
const storage = multer.memoryStorage();

// Optional: Add file filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = file.mimetype.split("/")[1];
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
