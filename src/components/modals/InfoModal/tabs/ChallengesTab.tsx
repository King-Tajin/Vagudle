import { ActivityLink } from "../../../ActivityLink";

export const ChallengesTab = () => {
  return (
    <div className="space-y-4">
      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        IN THE GAME
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Open <span className="text-crown-gold">Settings</span> and go to the{" "}
        <span className="text-crown-gold">Challenge</span> tab. Pick a
        dictionary, choose how many guesses to allow, type your secret word, and
        hit Generate Link. Share the link to let others play your custom word
        with exactly the settings you chose.
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Results never count toward the recipient's stats, and their progress is
        saved to the link so they can come back to it any time.
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        VIA DISCORD
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        In the{" "}
        <ActivityLink
          href="https://discord.gg/sU2XRxK8EB"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          King-Tajin Discord server
        </ActivityLink>
        , use the <span className="text-crown-gold">/vagudle_challenge</span>{" "}
        slash command to generate a challenge link directly from Discord.
      </p>
    </div>
  );
};
