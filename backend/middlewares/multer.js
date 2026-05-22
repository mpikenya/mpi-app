const multer = require("multer");

// Use memory storage so files don’t get saved locally
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log("UPLOAD MIME:", file.mimetype);

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only images are allowed. Got: ${file.mimetype}`));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
