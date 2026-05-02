// 1. Move dotenv to the VERY top
require("dotenv").config(); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Import all your route files ---
const testimonialRoutes = require("./routes/testimonialRoutes.js");
const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const galleryRoutes = require("./routes/galleryRoutes.js");
const newsRoutes = require("./routes/newsRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const volunteerRoutes = require("./routes/volunteerRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatbotRoutes = require("./routes/chatbot.routes.js");
const partnerRoutes = require("./routes/partnerRoutes.js");

const app = express();

// 2. Middleware
app.use(express.json());
app.use(cors());

// 3. Root endpoint (Move this OUTSIDE the DB connection logic)
app.get("/", (req, res) => {
  res.send("✅ Mathare Peace Initiative (MPI) Backend is running very well");
});

// --- Use your routes ---
app.use("/api/gallery", galleryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/testimonials", testimonialRoutes);

// 4. MongoDB Connection (Cleaned up deprecated options)
mongoose
  .connect(process.env.MONGODB_URI) // Removed useNewUrlParser and useUnifiedTopology
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 5. Conditional Listen (For Local Development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// 6. CRITICAL: Export app for Vercel
module.exports = app;