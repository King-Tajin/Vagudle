import { ActivityLink } from "../../../ActivityLink";
import strings from "../../../../constants/strings";

export const ChallengesTab = () => {
  return (
    <div className="space-y-4">
      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {strings.CHALLENGES_IN_GAME_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.CHALLENGES_STEP1_TEXT_PART1}{" "}
        <span className="text-crown-gold">
          {strings.CHALLENGES_SETTINGS_LABEL}
        </span>{" "}
        {strings.CHALLENGES_STEP1_TEXT_PART2}{" "}
        <span className="text-crown-gold">
          {strings.CHALLENGES_CHALLENGE_TAB_LABEL}
        </span>{" "}
        {strings.CHALLENGES_STEP1_TEXT_PART3}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.CHALLENGES_RESULTS_NOTE_TEXT}
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {strings.CHALLENGES_VIA_DISCORD_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.CHALLENGES_DISCORD_TEXT_PART1}{" "}
        <ActivityLink
          href="https://discord.gg/sU2XRxK8EB"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {strings.CHALLENGES_DISCORD_LINK_TEXT}
        </ActivityLink>
        {strings.CHALLENGES_DISCORD_TEXT_PART2}{" "}
        <span className="text-crown-gold">/vagudle_challenge</span>{" "}
        {strings.CHALLENGES_DISCORD_TEXT_PART3}
      </p>
    </div>
  );
};
