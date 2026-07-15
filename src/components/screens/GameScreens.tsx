import { m } from "framer-motion";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import { isDiscordActivity } from "../../lib/discord";
import { emptyNavbar, title } from "./screenHelpers";

export const LoadingScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-6">
      {title}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <m.div
              key={i}
              className="w-2 h-2"
              style={{ background: "#d4af37" }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        <p className="font-pixel text-xs text-crown-amber tracking-widest">
          LOADING WORDS...
        </p>
      </m.div>
    </div>
  </div>
);
