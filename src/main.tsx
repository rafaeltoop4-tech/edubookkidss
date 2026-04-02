import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useAuthStore } from "./store/authStore";

// Initialize auth before rendering
useAuthStore.getState().initialize();

createRoot(document.getElementById("root")!).render(<App />);
