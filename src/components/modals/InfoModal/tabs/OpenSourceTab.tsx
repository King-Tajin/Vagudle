import { useState } from "react";
import { ActivityLink } from "../../../ActivityLink";
import {
  SOURCE_CODE_URL,
  GITHUB_STATS_CARD_URL,
} from "../../../../constants/settings";
import strings from "../../../../constants/strings";

export const OpenSourceTab = () => {
  const [statsCardFailed, setStatsCardFailed] = useState(false);

  return (
    <div className="space-y-4">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        <ActivityLink
          href={SOURCE_CODE_URL}
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          Vagudle
        </ActivityLink>{" "}
        {strings.OPEN_SOURCE_INTRO_TEXT_MIDDLE}{" "}
        <ActivityLink
          href="https://github.com/markzither/react-wordle"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          react-wordle
        </ActivityLink>
        {strings.OPEN_SOURCE_INTRO_TEXT_END}
      </p>

      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.OPEN_SOURCE_MADE_BY_TEXT}{" "}
        <ActivityLink
          href="https://github.com/King-Tajin"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          King Tajin
        </ActivityLink>
        .
      </p>

      {!statsCardFailed && (
        <div className="flex justify-center pt-1 pb-2">
          <ActivityLink href={SOURCE_CODE_URL}>
            <img
              src={GITHUB_STATS_CARD_URL}
              alt={strings.OPEN_SOURCE_STATS_CARD_ALT}
              width={380}
              height={300}
              style={{ maxWidth: "100%", height: "auto" }}
              onError={() => setStatsCardFailed(true)}
            />
          </ActivityLink>
        </div>
      )}
    </div>
  );
};
