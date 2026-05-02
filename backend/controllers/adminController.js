const Admin = require('../models/Admin'); // Adjust path if your models folder is elsewhere
const asyncHandler = require('express-async-handler'); // Recommended for cleaner error handling

/**
 * @desc    Add a new admin
 * @route   POST /api/admin/add-admin
 * @access  Private (requires an authenticated admin token)
 */
const addAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate incoming data
  if (!name || !email || !password) {
    res.status(400); // Bad Request
    throw new Error('Please provide all required fields: name, email, and password.');
  }

  // 2. Check if an admin with that email already exists
  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400); // Bad Request
    throw new Error(`An admin with the email '${email}' already exists.`);
  }

  // 3. Create the new admin
  // Your Admin.js model already has a pre-save hook to hash the password,
  // so we can provide the plain password here and Mongoose will handle the rest.
  const admin = await Admin.create({
    name,
    email,
    password,
  });

  // 4. Send a successful response
  if (admin) {
    res.status(201).json({ // 201 = "Created"
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      message: 'Admin account created successfully.'
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data provided.');
  }
});

module.exports = {
  addAdmin,
};