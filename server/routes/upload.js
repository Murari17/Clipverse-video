const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

ffmpeg.setFfmpegPath(ffmpegStatic);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

[uploadsDir, videosDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.log('Error getting video duration:', err);
        resolve(0);
      } else {
        const duration = Math.floor(metadata.format.duration);
        console.log('Video duration:', duration, 'seconds');
        resolve(duration);
      }
    });
  });
};

router.post('/video', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (!thumbnailFile) {
      return res.status(400).json({ message: 'Thumbnail image is required' });
    }

    const videoUrl = `/uploads/videos/${videoFile.filename}`;
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;
    let duration = 0;
    const videoTitle = title || 'Untitled Video';

    try {
      duration = await getVideoDuration(videoFile.path);
    } catch (err) {
      console.error('Error getting video duration:', err);
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    const newVideo = new Video({
      title: videoTitle,
      description: description || '',
      uploader: req.user.username,
      uploaderId: req.user.id,
      videoUrl,
      thumbnail: thumbnailUrl,
      duration: duration,
      category: category || 'Other',
      tags: parsedTags
    });

    const savedVideo = await newVideo.save();
    
    console.log('Video saved successfully:', {
      title: savedVideo.title,
      thumbnail: savedVideo.thumbnail,
      uploader: savedVideo.uploader
    });
    
    res.status(201).json({
      message: 'Video uploaded successfully!',
      video: savedVideo
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      message: 'Error uploading video',
      error: error.message 
    });
  }
});

router.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(videosDir, filename);
  
  if (fs.existsSync(videoPath)) {
    res.sendFile(videoPath);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
});

router.get('/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const thumbnailPath = path.join(thumbnailsDir, filename);
  
  if (fs.existsSync(thumbnailPath)) {
    res.sendFile(thumbnailPath);
  } else {
    res.status(404).json({ message: 'Thumbnail not found' });
  }
});

module.exports = router;
