import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/videos');
      setVideos(response.data);
    } catch (error) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        <h1 className="page-title">Featured Videos</h1>
        
        <div className="videos-grid">
          {videos.length === 0 ? (
            <div className="no-videos">
              <p>No videos available at the moment.</p>
            </div>
          ) : (
            videos.map(video => (
              <Link to={`/video/${video._id}`} key={video._id} className="video-card">
                <div className="video-thumbnail">
                  <img 
                    src={video.thumbnail || 'https://via.placeholder.com/320x180/333333/ffffff?text=Video'} 
                    alt={video.title}
                  />
                </div>
                
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-channel">{video.uploader}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
