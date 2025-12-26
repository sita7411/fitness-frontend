// backend/controllers/settingsController.js
const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        address: "123 Fitness Street, Wellness City",
        phone: "+123 456 7890",
        email: "support@fitnessapp.com",
        mapEmbed: "",
        floatingIcons: [
          { icon: "Mail", x: "10%", y: "30%", delay: 0 },
          { icon: "Phone", x: "85%", y: "40%", delay: 1 },
          { icon: "MapPin", x: "20%", y: "70%", delay: 1.5 },
        ],
        logo: null,
      });
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { address, phone, email, mapEmbed, floatingIcons } = req.body;

    let parsedIcons = floatingIcons;
    if (typeof floatingIcons === 'string') {
      parsedIcons = JSON.parse(floatingIcons);
    }

    const updates = {
      address,
      phone,
      email,
      mapEmbed,
      floatingIcons: parsedIcons,
    };

    // If logo uploaded via Cloudinary
    if (req.file) {
      updates.logo = req.file.path; // Cloudinary returns full URL in req.file.path
      // Optional: also store secure_url or public_id if needed
      // updates.logoPublicId = req.file.filename;
    }

    let settings = await Settings.findOne();

    if (settings) {
      Object.assign(settings, updates);
      await settings.save();
    } else {
      settings = new Settings(updates);
      await settings.save();
    }

    res.status(200).json({
      message: 'Settings updated successfully!',
      settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};