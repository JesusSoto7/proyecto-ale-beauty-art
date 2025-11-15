import { createContext, useContext, useState } from "react";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import "../assets/stylesheets/AlertProviders.css";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

    const addAlert = (msg, type = "info", duration = 5000) => {
      const id = Date.now();

      setAlerts((prev) => {
        const newAlerts = [{ id, msg, type, duration, closing: false }, ...prev];
        return newAlerts.slice(0, 4);
      });

      // Auto-remover luego del tiempo indicado
      setTimeout(() => startClosing(id), duration);
    };


    const startClosing = (id) => {
        setAlerts((prev) =>
            prev.map((alert) =>
            alert.id === id ? { ...alert, closing: true } : alert
            )
        );

        // Espera la animación y remueve
        setTimeout(() => removeAlert(id), 300);
    };

    const removeAlert = (id) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}

      <div className="alert-container">
        {alerts.map((alert) => (
            <div key={alert.id} className={`alert ${alert.type} ${alert.closing ? "closing" : ""}`}>
                <div className="alert-icon">
                {alert.type === "error" && <ErrorOutlineIcon/>}
                {alert.type === "warning" && <WarningAmberIcon/>}
                {alert.type === "info" && <InfoOutlineIcon/>}
                {alert.type === "success" && <CheckCircleOutlineIcon/>}
                </div>

                <div className="alert-message">
                    {alert.msg}
                </div>

                <div
                    className="alert-progress"
                    style={{ animationDuration: `${alert.duration}ms` }}
                ></div>


                <button className="close-btn" onClick={() => removeAlert(alert.id)}>✕</button>
            </div>
        ))}

      </div>
    </AlertContext.Provider>
  );
}
