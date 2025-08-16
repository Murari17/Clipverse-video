import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './VideoPage.css';

const VideoPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchRelatedVideos();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`/api/videos/${id}`);
      setVideo(response.data);
      
      // Increment view count
      await axios.post(`/api/videos/${id}/view`);
    } catch (error) {
      setError('Video not found');
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await axios.get(`/api/videos?limit=6&exclude=${id}`);
      setRelatedVideos(response.data);
    } catch (error) {
      console.error('Error fetching related videos:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Video not found'}</div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="video-page">
      <div className="container">
        <div className="video-layout">
          <div className="video-main">
            <div className="video-player">
              <video 
                controls 
                width="100%" 
                height="100%"
                poster={video.thumbnail}
                style={{ backgroundColor: '#000' }}
              >
                <source src={video.videoUrl || `/api/videos/${video._id}/stream`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="video-details">
              <h1 className="video-title">{video.title}</h1>
              
              <div className="video-meta">
                <div className="video-stats">
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="video-info">
                <div className="channel-info">
                  <h3>{video.uploader}</h3>
                </div>
              </div>
              
              {video.description && (
                <div className="video-description">
                  <h4>Description</h4>
                  <p>{video.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="video-sidebar">
            <h3>Related Videos</h3>
            <div className="related-videos">
              {relatedVideos.map(relatedVideo => (
                <Link 
                  to={`/video/${relatedVideo._id}`} 
                  key={relatedVideo._id}
                  className="related-video-card"
                >
                  <div className="related-thumbnail">
                    <img 
                      src={relatedVideo.thumbnail || '/api/placeholder/168/94'} 
                      alt={relatedVideo.title}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/168/94';
                      }}
                    />
                    <div className="related-duration">
                      {formatDuration(relatedVideo.duration || 0)}
                    </div>
                  </div>
                  
                  <div className="related-info">
                    <h4>{relatedVideo.title}</h4>
                    <p>{relatedVideo.uploader}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
