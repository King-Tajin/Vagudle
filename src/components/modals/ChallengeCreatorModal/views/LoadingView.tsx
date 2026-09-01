import { Loader2 } from "lucide-react";
import { BackButton } from "../Controls";
import strings from "../../../../constants/strings";

export const LoadingView = ({ onBack }: { onBack?: () => void }) => {
  return (
    <div className="space-y-3">
      {onBack && <BackButton onClick={onBack} />}
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="w-6 h-6 text-crown-amber animate-spin" />
        <p className="font-pixel text-xs text-gray-500 tracking-widest">
          {strings.CHALLENGE_CREATOR_GENERATING_LINK_TEXT}
        </p>
      </div>
    </div>
  );
};
