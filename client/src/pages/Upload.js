import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // Auto-generate title from filename if empty
      if (!formData.title) {
        const filename = file.name.split('.')[0];
        setFormData({
          ...formData,
          title: filename
        });
      }
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!thumbnailFile) {
      setError('Please select a thumbnail image');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload videos');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('video', videoFile);
      uploadData.append('thumbnail', thumbnailFile);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('tags', formData.tags);

      const response = await axios.post('/api/upload/video', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      console.log('Upload successful:', response.data);
      navigate('/'); // Redirect to home page after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to upload video');
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        setError('Cannot connect to server. Please check if the server is running.');
      } else {
        setError('Failed to upload video: ' + error.message);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="upload-container">
        <div className="upload-form">
          <h2>Please log in to upload videos</h2>
          <button onClick={() => navigate('/login')} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-form">
        <h2>Upload Video</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="video">Video File *</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={handleVideoChange}
              required
              disabled={uploading}
            />
            {videoFile && (
              <div className="file-info">
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail Image *</label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={uploading}
              required
            />
            <small className="form-hint">
              Please select a thumbnail image for your video (JPG, PNG, etc.)
            </small>
            {thumbnailFile && (
              <div className="file-info">
                Selected: {thumbnailFile.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={uploading}
              placeholder="Enter video title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="Enter video description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={uploading}
            >
              <option value="">Select category</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Music">Music</option>
              <option value="Gaming">Gaming</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="News">News</option>
              <option value="Documentary">Documentary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              disabled={uploading}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">Uploading: {uploadProgress}%</div>
            </div>
          )}

          <button 
            type="submit" 
            className="upload-btn"
            disabled={uploading || !videoFile || !thumbnailFile}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
