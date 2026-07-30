import { Suspense } from "react";
import { CloudSaveConflictModal } from "../../lazyComponents";
import type { CloudSave } from "../../lib/cloudSync";

type Props = {
  cloudSave: CloudSave;
  isMobile: boolean;
  onResolved: () => void;
};

export const CloudSaveConflictOverlay = ({
  cloudSave,
  isMobile,
  onResolved,
}: Props) => (
  <Suspense fallback={null}>
    <CloudSaveConflictModal
      cloudSave={cloudSave}
      isMobile={isMobile}
      onResolved={onResolved}
    />
  </Suspense>
);
