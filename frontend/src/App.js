import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Home from './pages/Home';
import RequestVideo from './pages/RequestVideo';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import Header from './components/Header';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/request" 
              element={
                <ProtectedRoute>
                  <RequestVideo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
