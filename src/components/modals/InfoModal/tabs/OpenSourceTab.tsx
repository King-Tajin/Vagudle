import { ActivityLink } from "../../../ActivityLink";
import { SOURCE_CODE_URL } from "../../../../constants/settings";
import {
  OPEN_SOURCE_PROJECT_LINK_TEXT,
  OPEN_SOURCE_INTRO_TEXT_MIDDLE,
  OPEN_SOURCE_BASED_ON_LINK_TEXT,
  OPEN_SOURCE_INTRO_TEXT_END,
  OPEN_SOURCE_MADE_BY_TEXT,
  OPEN_SOURCE_AUTHOR_LINK_TEXT,
} from "../../../../constants/strings";

export const OpenSourceTab = () => {
  return (
    <div className="space-y-4">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        <ActivityLink
          href={SOURCE_CODE_URL}
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {OPEN_SOURCE_PROJECT_LINK_TEXT}
        </ActivityLink>{" "}
        {OPEN_SOURCE_INTRO_TEXT_MIDDLE}{" "}
        <ActivityLink
          href="https://github.com/markzither/react-wordle"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {OPEN_SOURCE_BASED_ON_LINK_TEXT}
        </ActivityLink>
        {OPEN_SOURCE_INTRO_TEXT_END}
      </p>

      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {OPEN_SOURCE_MADE_BY_TEXT}{" "}
        <ActivityLink
          href="https://github.com/King-Tajin"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {OPEN_SOURCE_AUTHOR_LINK_TEXT}
        </ActivityLink>
        .
      </p>
    </div>
  );
};
