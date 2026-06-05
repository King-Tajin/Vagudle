import { motion } from "framer-motion";
import { BackgroundGrid } from "../background/BackgroundGrid";
import { Navbar } from "../Navbar";
import { isDiscordActivity } from "../../lib/discord";

type ReturnProps = {
  handleReturnToNormal: () => void;
};

const emptyNavbar = (isActivityMode = false) => (
  <Navbar
    setIsInfoModalOpen={() => {}}
    setIsStatsModalOpen={() => {}}
    setIsSettingsModalOpen={() => {}}
    handleNewGame={() => {}}
    hasActiveGame={false}
    isInfoModalOpen={false}
    isActivityMode={isActivityMode}
  />
);

const title = (
  <motion.p
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest"
  >
    VAGUDLE
  </motion.p>
);

const returnButton = (onClick: () => void) => (
  <button
    onClick={onClick}
    className="font-pixel text-xs tracking-widest px-4 py-2 transition-all"
    style={{
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.3)",
      color: "#d4af37",
    }}
  >
    PLAY NORMAL VAGUDLE
  </button>
);

const retryButton = () => (
  <button
    onClick={() => window.location.reload()}
    className="font-pixel text-xs tracking-widest px-4 py-2 transition-all"
    style={{
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.3)",
      color: "#d4af37",
    }}
  >
    TRY AGAIN
  </button>
);

export const LoadingScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-6">
      {title}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
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
      </motion.div>
    </div>
  </div>
);

export const MalformedChallengeScreen = ({
  handleReturnToNormal,
}: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar()}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          INVALID CHALLENGE LINK
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          This challenge link is broken or has been tampered with. Ask the
          sender to share it again.
        </p>
        {returnButton(handleReturnToNormal)}
      </motion.div>
    </div>
  </div>
);

export const MalformedDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          INVALID DUEL LINK
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          This duel link is broken or has been tampered with. Ask for a new
          link.
        </p>
        {!isDiscordActivity && returnButton(handleReturnToNormal)}
      </motion.div>
    </div>
  </div>
);

export const ExpiredDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          DUEL EXPIRED
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          This duel link has expired. Duel links are only valid for 24 hours.
          Ask for a new duel to be created.
        </p>
        {!isDiscordActivity && returnButton(handleReturnToNormal)}
      </motion.div>
    </div>
  </div>
);

export const ActivityNotFoundScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          DUEL EXPIRED
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          This duel has expired. Activity duels are only valid for 24 hours. Ask
          for a new duel to be sent in Discord.
        </p>
      </motion.div>
    </div>
  </div>
);

export const ActivityWrongPlayerScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          WRONG ACCOUNT
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          This duel was not sent to your Discord account. Make sure you are
          logged in as the right user.
        </p>
      </motion.div>
    </div>
  </div>
);

export const ActivityServerErrorScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
          SOMETHING WENT WRONG
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-1">
          Could not load your duel. Try rejoining the activity from Discord.
        </p>
        <p className="font-code text-xs text-gray-600 leading-relaxed mb-4">
          If this keeps happening, check the browser console for details.
        </p>
        {retryButton()}
      </motion.div>
    </div>
  </div>
);
