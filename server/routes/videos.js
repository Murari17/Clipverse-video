const express = require('express');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 20, skip = 0, exclude } = req.query;
    
    let query = {};
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const videos = await Video.find(query)
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(500).json({ message: 'Error fetching video' });
  }
});

router.post('/:id/view', verifyToken, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'View count updated', views: video.views });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ message: 'Error updating view count' });
  }
});

module.exports = router;
