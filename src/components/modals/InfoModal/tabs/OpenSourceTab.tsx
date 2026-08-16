import { ActivityLink } from "../../../ActivityLink";
import { SOURCE_CODE_URL } from "../../../../constants/settings";

export const OpenSourceTab = () => {
  return (
    <div className="space-y-4">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        <ActivityLink
          href={SOURCE_CODE_URL}
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          Vagudle
        </ActivityLink>{" "}
        is open source and based on{" "}
        <ActivityLink
          href="https://github.com/markzither/react-wordle"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          react-wordle
        </ActivityLink>
        . Contributions and feedback are welcome.
      </p>

      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Made by{" "}
        <ActivityLink
          href="https://github.com/King-Tajin"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          King Tajin
        </ActivityLink>
        .
      </p>
    </div>
  );
};
