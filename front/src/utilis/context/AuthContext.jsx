import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

import URL from "../constants/url";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const login = async (dataForm) => {
    setLoading(true);
    try {
      const { data, status } = await axios.post(URL.AUTH_LOGIN, dataForm);
      console.log('✅ Response data:', data);
      
      if (status === 200) {
        setUser(data);
        localStorage.setItem("auth", JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.response?.data || error.message);
      // Effacer les données en cas d'erreur
      setUser(null);
      localStorage.removeItem("auth");
      throw error; // Re-lancer l'erreur pour la gérer dans Login.jsx
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

const logout = () => {
  setUser(null);
  localStorage.removeItem("auth");
  return true; 
};

  const isLoggedIn = () => {
    const storedAuth = localStorage.getItem("auth");
    
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUser(parsedAuth);
      } catch (error) {
        console.error('Erreur lors du parsing de localStorage:', error);
        localStorage.removeItem("auth");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};