const Settings = require('../models/Settings');
const path = require('path');

// GET: Fetch current settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
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

    // If logo exists, prepend base URL (adjust if deployed)
    if (settings.logo) {
      settings.logo = `${req.protocol}://${req.get('host')}${settings.logo}`;
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/PUT: Update settings (with optional logo upload via multer)
exports.updateSettings = async (req, res) => {
  try {
    const { address, phone, email, mapEmbed, floatingIcons } = req.body;

    // Parse floatingIcons if sent as string (from FormData)
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

    // Handle logo upload
    if (req.file) {
      updates.logo = `/uploads/${req.file.filename}`;
    }

    let settings = await Settings.findOne();

    if (settings) {
      Object.assign(settings, updates);
      await settings.save();
    } else {
      settings = new Settings(updates);
      await settings.save();
    }

    // Return full URL for logo in response
    if (settings.logo) {
      settings.logo = `${req.protocol}://${req.get('host')}${settings.logo}`;
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