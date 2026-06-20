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
