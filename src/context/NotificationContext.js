"use client";
import { createContext, useState } from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (
    message,
    severity = "info",
    title = null,
    duration = 6000
  ) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      severity,
      title,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove notification
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const showSuccess = (message, title = "Berhasil") => {
    showNotification(message, "success", title);
  };

  const showError = (message, title = "Error") => {
    showNotification(message, "error", title);
  };

  const showWarning = (message, title = "Peringatan") => {
    showNotification(message, "warning", title);
  };

  const showInfo = (message, title = "Info") => {
    showNotification(message, "info", title);
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Render notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: notification.id === notifications[0]?.id ? 8 : 0 }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
