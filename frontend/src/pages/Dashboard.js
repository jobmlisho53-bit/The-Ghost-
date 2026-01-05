import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import api from '../services/api';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/content/requests');
        setRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--matrix-green)';
      case 'processing': return 'var(--cyber-blue)';
      case 'pending': return 'var(--neon-orange)';
      case 'failed': return 'var(--glitch-red)';
      default: return 'white';
    }
  };

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <h2 className="section-title">Your Dashboard</h2>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p>{requests.length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{requests.filter(r => r.status === 'completed').length}</p>
          </div>
          <div className="stat-card">
            <h3>Processing</h3>
            <p>{requests.filter(r => r.status === 'processing').length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{requests.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
        
        <div className="requests-section">
          <h3>Your Video Requests</h3>
          {loading ? (
            <p>Loading your requests...</p>
          ) : (
            <div className="requests-list">
              {requests.length === 0 ? (
                <p>No video requests yet. <a href="/request">Create your first AI video</a></p>
              ) : (
                requests.map(request => (
                  <div key={request._id} className="request-item">
                    <div className="request-info">
                      <h4>{request.topic}</h4>
                      <p>Duration: {request.duration}s</p>
                      <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="request-status">
                      <span 
                        className="status-badge" 
                        style={{ color: getStatusColor(request.status) }}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {request.video && (
                        <button className="cta-button secondary small">
                          <i className="fas fa-play"></i> Watch
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
