import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AlertProvider } from "./context/AlertContext";
import { initDiscordSDK } from "./lib/discord";

async function bootstrap() {
  await initDiscordSDK();
  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <AlertProvider>
        <App />
      </AlertProvider>
    </React.StrictMode>
  );
}

void bootstrap();
