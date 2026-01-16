import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
      <h1>React Test</h1>
      <p>This is a simple React component to test if React is working.</p>
    </div>
  </React.StrictMode>
);
