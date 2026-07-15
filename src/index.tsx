import React from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App";
import { AlertProvider } from "./context/AlertContext";
import { initDiscordSDK } from "./lib/discord";

async function bootstrap() {
  await initDiscordSDK();
  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <AlertProvider>
            <App />
          </AlertProvider>
        </MotionConfig>
      </LazyMotion>
    </React.StrictMode>
  );
}

void bootstrap();
