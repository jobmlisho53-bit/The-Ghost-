import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './styles/Home.css';

const Home = () => {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize particles and terminal effects
    const createParticles = () => {
      const container = document.getElementById('particles');
      if (!container) return;
      
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        const size = 1 + Math.random() * 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        const colors = [
          'var(--cyber-blue)',
          'var(--neon-orange)',
          'var(--matrix-green)',
          'var(--hologram-purple)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        const duration = 3 + Math.random() * 7;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        container.appendChild(particle);
      }
    };

    const runTerminal = () => {
      const terminal = document.getElementById('terminal');
      if (!terminal) return;
      
      const terminalMessages = [
        "> INITIALIZING NEURAL NETWORKS...",
        "> VIDEO SYNTHESIS: 98.7% REALISM ACHIEVED",
        "> GENERATING CINEMATIC CONTENT...",
        "> GHOST CREATORS v4.7 ONLINE",
        "> AI MODELS: 3,542 ACTIVE",
        "> PROCESSING USER REQUEST...",
        "> RENDERING VIDEO: COMPLETE"
      ];
      
      let messageIndex = 0;
      const showNextMessage = () => {
        terminal.textContent = terminalMessages[messageIndex];
        terminal.style.animation = 'none';
        void terminal.offsetWidth;
        terminal.style.animation = 'terminalFade 8s linear infinite';
        messageIndex = (messageIndex + 1) % terminalMessages.length;
        const nextInterval = 8000 + Math.random() * 5000;
        setTimeout(showNextMessage, nextInterval);
      };
      showNextMessage();
    };

    // Create elements if they don't exist
    if (!document.getElementById('particles')) {
      const particlesDiv = document.createElement('div');
      particlesDiv.id = 'particles';
      particlesDiv.className = 'particles';
      document.body.appendChild(particlesDiv);
    }

    if (!document.getElementById('terminal')) {
      const terminalDiv = document.createElement('div');
      terminalDiv.id = 'terminal';
      terminalDiv.className = 'terminal-line';
      document.body.appendChild(terminalDiv);
    }

    createParticles();
    runTerminal();

    // Add interactive functionality
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
      item.addEventListener('click', function() {
        const title = this.querySelector('.video-title').textContent;
        showAIPreview(`Playing: ${title}`);
      });
    });

    const shortItems = document.querySelectorAll('.short-item');
    shortItems.forEach(item => {
      item.addEventListener('click', function() {
        const title = this.querySelector('.short-title').textContent;
        showAIPreview(`Playing: ${title} (SHORT)`);
      });
    });

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', function() {
        const title = this.querySelector('.category-title').textContent;
        showAIPreview(`Browsing ${title} category`);
      });
    });

    const feedTabs = document.querySelectorAll('.feed-tab');
    feedTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        feedTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const filter = this.textContent;
        showAIPreview(`Filtering by: ${filter}`);
      });
    });

    const ctaPrimary = document.querySelector('.cta-button.primary');
    if (ctaPrimary) {
      ctaPrimary.addEventListener('click', function() {
        showAIPreview('Browsing all AI-generated videos');
      });
    }

    const ctaSecondary = document.querySelector('.cta-button.secondary');
    if (ctaSecondary) {
      ctaSecondary.addEventListener('click', function() {
        window.location.href = '/request';
      });
    }

    const createButton = document.querySelector('.create-button');
    if (createButton) {
      createButton.addEventListener('click', function() {
        window.location.href = '/request';
      });
    }

    const searchInput = document.querySelector('.search-bar');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          showAIPreview(`Searching for: "${this.value}"`);
          this.value = '';
        }
      });
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        const label = this.querySelector('.nav-label').textContent;
        showAIPreview(`Navigating to ${label}`);
      });
    });

    // Fetch trending topics
    const fetchTrendingTopics = async () => {
      try {
        const response = await api.get('/content/trending');
        setTrendingTopics(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
        setLoading(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  // AI Preview Modal function
  const showAIPreview = (message) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.3s ease;
    `;

    const preview = document.createElement('div');
    preview.style.cssText = `
      background: linear-gradient(135deg, rgba(6, 6, 26, 0.95), rgba(26, 26, 46, 0.95));
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      border: 2px solid var(--cyber-blue);
      box-shadow: 0 0 60px rgba(0, 240, 255, 0.3);
      position: relative;
      overflow: hidden;
      animation: slideUp 0.4s ease;
    `;

    const cornerTL = document.createElement('div');
    cornerTL.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      width: 20px;
      height: 20px;
      border-top: 2px solid var(--cyber-blue);
      border-left: 2px solid var(--cyber-blue);
    `;

    const cornerTR = document.createElement('div');
    cornerTR.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      border-top: 2px solid var(--cyber-blue);
      border-right: 2px solid var(--cyber-blue);
    `;

    const cornerBL = document.createElement('div');
    cornerBL.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      width: 20px;
      height: 20px;
      border-bottom: 2px solid var(--cyber-blue);
      border-left: 2px solid var(--cyber-blue);
    `;

    const cornerBR = document.createElement('div');
    cornerBR.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      border-bottom: 2px solid var(--cyber-blue);
      border-right: 2px solid var(--cyber-blue);
    `;

    const aiIcon = document.createElement('div');
    aiIcon.innerHTML = '<i class="fas fa-robot" style="font-size: 3rem; color: var(--matrix-green); margin-bottom: 20px;"></i>';

    const messageElement = document.createElement('h3');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      color: white;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      margin-bottom: 20px;
      line-height: 1.3;
    `;

    const status = document.createElement('p');
    status.textContent = 'Ghost Creators AI Processing...';
    status.style.cssText = `
      color: var(--matrix-green);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      margin-bottom: 30px;
      animation: pulse 1.5s infinite;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'CONTINUE';
    closeButton.style.cssText = `
      background: linear-gradient(135deg, var(--cyber-blue), var(--hologram-purple));
      color: #000;
      border: none;
      padding: 12px 30px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      letter-spacing: 1px;
    `;

    closeButton.addEventListener('mouseover', function() {
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)';
    });

    closeButton.addEventListener('mouseout', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = 'none';
    });

    closeButton.addEventListener('click', function() {
      document.body.removeChild(overlay);
    });

    preview.appendChild(cornerTL);
    preview.appendChild(cornerTR);
    preview.appendChild(cornerBL);
    preview.appendChild(cornerBR);
    preview.appendChild(aiIcon);
    preview.appendChild(messageElement);
    preview.appendChild(status);
    preview.appendChild(closeButton);
    overlay.appendChild(preview);

    document.body.appendChild(overlay);

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 3000);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn{ from{ opacity: 0;} to{ opacity: 1;} }
      @keyframes slideUp{ from{ transform: translateY(30px); opacity: 0;} to{ transform: translateY(0); opacity: 1;} }
      @keyframes pulse{ 0%, 100%{ opacity: 0.7;} 50%{ opacity: 1;} }
    `;
    document.head.appendChild(style);
  };

  return (
    <div className="main-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="main-headline glitch-container">
            <span className="headline-main glitch" data-text="WATCH THE FUTURE">WATCH THE FUTURE</span>
            <span className="headline-sub">OF AI-CREATED VIDEOS</span>
          </h1>
          <p className="hero-description">
            Welcome to Ghost Creators, where artificial intelligence generates breathtaking video content.
            Explore neural networks creating cinematic masterpieces, abstract art, and hyper-realistic simulations.
            No cameras. No limits.
          </p>
          <div className="cta-container">
            <button className="cta-button primary">
              <i className="fas fa-play-circle"></i> BROWSE VIDEOS
            </button>
            <button className="cta-button secondary" onClick={() => window.location.href='/request'}>
              <i className="fas fa-plus"></i> SUBMIT TOPIC
            </button>
          </div>
          <div className="ai-stats">
            <div className="stat-item">
              <div className="stat-value">12.8M</div>
              <div className="stat-label">AI Videos</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98.7%</div>
              <div className="stat-label">Realism</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">3.5K</div>
              <div className="stat-label">Neural Models</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Categories */}
      <section className="categories-section">
        <h2 className="section-title">AI VIDEO CATEGORIES</h2>
        <div className="categories-grid">
          <div className="category-card">
            <i className="fas fa-film category-icon"></i>
            <h3 className="category-title">Cinematic AI</h3>
            <p className="category-desc">Feature-length films generated by neural networks</p>
          </div>
          <div className="category-card">
            <i className="fas fa-palette category-icon"></i>
            <h3 className="category-title">Abstract Art</h3>
            <p className="category-desc">Visual experiments and AI art explorations</p>
          </div>
          <div className="category-card">
            <i className="fas fa-graduation-cap category-icon"></i>
            <h3 className="category-title">Educational</h3>
            <p className="category-desc">AI-generated explanations and visual learning</p>
          </div>
          <div className="category-card">
            <i className="fas fa-music category-icon"></i>
            <h3 className="category-title">Music Visuals</h3>
            <p className="category-desc">AI synesthesia: seeing sound through algorithms</p>
          </div>
        </div>
      </section>

      {/* Video Feed */}
      <section className="video-feed-section">
        <div className="video-feed-header">
          <h2 className="section-title">RECOMMENDED</h2>
          <div className="feed-tabs">
            <button className="feed-tab active">For You</button>
            <button className="feed-tab">Trending</button>
            <button className="feed-tab">New</button>
            <button className="feed-tab">AI Cinema</button>
            <button className="feed-tab">Abstract</button>
          </div>
        </div>
        <div className="video-grid">
          {/* Video 1 */}
          <div className="video-item">
            <div className="video-thumbnail">
              <div className="ai-badge">AI GENERATED</div>
              <div className="play-button">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">Neural Dreams: AI's Vision of Future Cities</h3>
              <div className="video-meta">
                <div className="video-author">
                  <div className="author-avatar"></div>
                  <span>Ghost Urban AI</span>
                </div>
                <div className="video-views">2.4M views</div>
              </div>
            </div>
          </div>
          {/* Video 2 */}
          <div className="video-item">
            <div className="video-thumbnail">
              <div className="ai-badge">AI GENERATED</div>
              <div className="play-button">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">Quantum Symphony: Abstract AI Visualization</h3>
              <div className="video-meta">
                <div className="video-author">
                  <div className="author-avatar"></div>
                  <span>Neural Art Lab</span>
                </div>
                <div className="video-views">1.8M views</div>
              </div>
            </div>
          </div>
          {/* Video 3 */}
          <div className="video-item">
            <div className="video-thumbnail">
              <div className="ai-badge">AI GENERATED</div>
              <div className="play-button">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">How AI Creates Hyper-Realistic Humans</h3>
              <div className="video-meta">
                <div className="video-author">
                  <div className="author-avatar"></div>
                  <span>AI Explained</span>
                </div>
                <div className="video-views">3.1M views</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shorts Section */}
      <section className="shorts-section">
        <div className="shorts-header">
          <i className="fas fa-bolt shorts-icon"></i>
          <h2 className="section-title">AI SHORTS</h2>
        </div>
        <div className="shorts-container">
          {/* Short 1 */}
          <div className="short-item">
            <div className="short-thumbnail">
              <div className="short-badge">SHORT</div>
              <div className="short-play">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="short-info">
              <h3 className="short-title">AI Creates 60s Horror Film</h3>
              <div className="short-stats">
                <span>457K views</span>
                <span>1:02</span>
              </div>
            </div>
          </div>
          {/* Short 2 */}
          <div className="short-item">
            <div className="short-thumbnail">
              <div className="short-badge">SHORT</div>
              <div className="short-play">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="short-info">
              <h3 className="short-title">AI Comedy: Robot Standup</h3>
              <div className="short-stats">
                <span>892K views</span>
                <span>0:48</span>
              </div>
            </div>
          </div>
          {/* Short 3 */}
          <div className="short-item">
            <div className="short-thumbnail">
              <div className="short-badge">SHORT</div>
              <div className="short-play">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="short-info">
              <h3 className="short-title">How AI Sees Music</h3>
              <div className="short-stats">
                <span>1.2M views</span>
                <span>0:59</span>
              </div>
            </div>
          </div>
          {/* Short 4 */}
          <div className="short-item">
            <div className="short-thumbnail">
              <div className="short-badge">SHORT</div>
              <div className="short-play">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="short-info">
              <h3 className="short-title">AI Future Predictions</h3>
              <div className="short-stats">
                <span>764K views</span>
                <span>0:52</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create Button */}
      <button className="create-button" onClick={() => window.location.href='/request'}>
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default Home;
