// backend/routes/settings.js (Express Routes)
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');

// Multer setup for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Create 'uploads' folder in project root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        address: "123 Fitness Street, Wellness City",
        phone: "+123 456 7890",
        email: "support@fitnessapp.com",
        mapEmbed: "",
        floatingIcons: [
          { icon: "Mail", x: "10%", y: "30%", delay: 0 },
          { icon: "Phone", x: "85%", y: "40%", delay: 1 },
          { icon: "MapPin", x: "20%", y: "70%", delay: 1.5 }
        ]
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST/PUT update settings (with optional logo upload)
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const updates = {
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      mapEmbed: req.body.mapEmbed,
      floatingIcons: JSON.parse(req.body.floatingIcons)  // Sent as JSON string
    };

    if (req.file) {
      updates.logo = `/uploads/${req.file.filename}`;  // Accessible URL
    }

    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findOneAndUpdate({}, updates, { new: true });
    } else {
      settings = await Settings.create(updates);
    }

    res.json({ message: 'Settings saved!', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;