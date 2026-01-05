import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

const AppContext = createContext();

const initialState = {
  isAuthenticated: authService.isAuthenticated(),
  user: authService.getCurrentUser(),
  loading: false,
  error: null,
  videoRequests: [],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        videoRequests: [],
      };
    case 'SET_VIDEO_REQUESTS':
      return {
        ...state,
        videoRequests: action.payload,
      };
    case 'ADD_VIDEO_REQUEST':
      return {
        ...state,
        videoRequests: [action.payload, ...state.videoRequests],
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    if (authService.isAuthenticated()) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: authService.getCurrentUser(),
      });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authService.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data,
      });
      return data;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
