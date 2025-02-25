const Announcement = require('../models/Announcement');
const { checkPermission } = require('../middleware/permissions');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, image, startDate, endDate, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      type,
      image,
      startDate,
      endDate,
      priority,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      errors: [],
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort('-priority -createdAt');

    res.json({
      success: true,
      errors: [],
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        errors: ['Announcement not found'],
        data: null
      });
    }

    res.json({
      success: true,
      errors: [],
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByIdAndDelete(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        errors: ['Announcement not found'],
        data: null
      });
    }

    res.json({
      success: true,
      errors: [],
      data: { message: 'Announcement deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};