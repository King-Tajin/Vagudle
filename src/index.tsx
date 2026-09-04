import React from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App";
import { AlertProvider } from "./context/AlertContext";
import { initDiscordSDK } from "./lib/discord";
import { LinkDiscordPage } from "./components/screens/LinkDiscordPage";
import { LinkPlayGamesPage } from "./components/screens/LinkPlayGamesPage";
import { initCrashReporting, logBreadcrumb } from "./lib/crashReporting";
import { CrashBoundary } from "./components/CrashBoundary";
import { listenForReminderNotificationTaps } from "./lib/notifications";
import { DAILY_PATH } from "./lib/daily";

const isLinkDiscordRoute = window.location.pathname === "/link-discord";
const isLinkPlayGamesRoute = window.location.pathname === "/link-playgames";

function openDailyFromNotification(): void {
  void logBreadcrumb("Opened daily from reminder notification");
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentPath !== DAILY_PATH) {
    window.location.href = DAILY_PATH;
  }
}

async function bootstrap() {
  initCrashReporting();
  listenForReminderNotificationTaps(openDailyFromNotification);
  await initDiscordSDK();
  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <CrashBoundary>
            <AlertProvider>
              {isLinkDiscordRoute ? (
                <LinkDiscordPage />
              ) : isLinkPlayGamesRoute ? (
                <LinkPlayGamesPage />
              ) : (
                <App />
              )}
            </AlertProvider>
          </CrashBoundary>
        </MotionConfig>
      </LazyMotion>
    </React.StrictMode>
  );
}

void bootstrap();
