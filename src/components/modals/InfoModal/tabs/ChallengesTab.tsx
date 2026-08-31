import { ActivityLink } from "../../../ActivityLink";
import {
  CHALLENGES_IN_GAME_HEADING,
  CHALLENGES_STEP1_TEXT_PART1,
  CHALLENGES_SETTINGS_LABEL,
  CHALLENGES_STEP1_TEXT_PART2,
  CHALLENGES_CHALLENGE_TAB_LABEL,
  CHALLENGES_STEP1_TEXT_PART3,
  CHALLENGES_RESULTS_NOTE_TEXT,
  CHALLENGES_VIA_DISCORD_HEADING,
  CHALLENGES_DISCORD_TEXT_PART1,
  CHALLENGES_DISCORD_LINK_TEXT,
  CHALLENGES_DISCORD_TEXT_PART2,
  CHALLENGES_DISCORD_TEXT_PART3,
} from "../../../../constants/strings";

export const ChallengesTab = () => {
  return (
    <div className="space-y-4">
      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {CHALLENGES_IN_GAME_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {CHALLENGES_STEP1_TEXT_PART1}{" "}
        <span className="text-crown-gold">{CHALLENGES_SETTINGS_LABEL}</span>{" "}
        {CHALLENGES_STEP1_TEXT_PART2}{" "}
        <span className="text-crown-gold">
          {CHALLENGES_CHALLENGE_TAB_LABEL}
        </span>{" "}
        {CHALLENGES_STEP1_TEXT_PART3}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {CHALLENGES_RESULTS_NOTE_TEXT}
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {CHALLENGES_VIA_DISCORD_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {CHALLENGES_DISCORD_TEXT_PART1}{" "}
        <ActivityLink
          href="https://discord.gg/sU2XRxK8EB"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {CHALLENGES_DISCORD_LINK_TEXT}
        </ActivityLink>
        {CHALLENGES_DISCORD_TEXT_PART2}{" "}
        <span className="text-crown-gold">/vagudle_challenge</span>{" "}
        {CHALLENGES_DISCORD_TEXT_PART3}
      </p>
    </div>
  );
};
