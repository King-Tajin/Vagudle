import { m } from "framer-motion";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import { isDiscordActivity } from "../../lib/discord";
import { emptyNavbar, title, returnButton, retryButton } from "./screenHelpers";

type ReturnProps = {
  handleReturnToNormal: () => void;
};

export const MalformedChallengeScreen = ({
  handleReturnToNormal,
}: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar()}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);

export const MalformedDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);

export const ExpiredDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);

export const ActivityNotFoundScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);

export const ActivityWrongPlayerScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);

export const ActivityServerErrorScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
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
      </m.div>
    </div>
  </div>
);
