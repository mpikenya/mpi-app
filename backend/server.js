// server.js (CommonJS version)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Use your routes ---
app.use("/api/gallery", galleryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// ✅ Add new routes for partners & testimonials
app.use("/api/partners", partnerRoutes);
app.use("/api/testimonials", testimonialRoutes);

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

    // Root endpoint
    app.get("/", (req, res) => {
      res.send("✅ Mathare Peace Initiative (MPI) Backend is running very well");
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
