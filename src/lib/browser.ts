import { UAParser } from "ua-parser-js";

const inAppBrowserNames = [
  "Facebook",
  "Instagram",
  "Line",
  "Messenger",
  "Puffin",
  "Twitter",
  "WeChat",
];

export const isInAppBrowser = () => {
  const browser = new UAParser().getBrowser();
  return inAppBrowserNames.indexOf(browser.name ?? "") > -1;
};

export const isNativeApp = () =>
  typeof window !== "undefined" &&
  window.Capacitor?.isNativePlatform?.() === true;
