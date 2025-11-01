import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const AlertContext = createContext();

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de un AlertProvider');
  }
  return context;
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, severity = 'info', duration = 5000) => {
    const id = Date.now();
    const newAlert = { id, message, severity, duration };
    setAlerts(prev => [...prev, newAlert]);

    // Auto-remove alert after duration
    setTimeout(() => {
      removeAlert(id);
    }, duration);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => removeAlert(alert.id)}
        >
          <Alert
            onClose={() => removeAlert(alert.id)}
            severity={alert.severity}
            variant="filled"
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </AlertContext.Provider>
  );
}