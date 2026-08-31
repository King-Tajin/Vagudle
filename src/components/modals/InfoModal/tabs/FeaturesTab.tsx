import strings from "../../../../constants/strings";

export const FeaturesTab = () => {
  return (
    <ul className="space-y-4">
      {strings.FEATURES_LIST.map(([feature, desc]) => (
        <li
          key={feature}
          className="flex flex-col gap-1 pb-4 border-b border-obsidian-700 last:border-0 last:pb-0"
        >
          <span className="font-pixel text-xs text-crown-gold tracking-wide">
            {feature}
          </span>
          <span className="font-code text-sm text-gray-400">{desc}</span>
        </li>
      ))}
    </ul>
  );
};
