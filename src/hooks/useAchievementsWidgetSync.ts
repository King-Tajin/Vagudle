import { useEffect } from "react";
import {
  buildAchievementsWidgetPayload,
  type AchievementsWidgetInput,
} from "../lib/achievementsWidget";
import { syncWidget } from "../lib/widgetSync";

export const useAchievementsWidgetSync = (input: AchievementsWidgetInput) => {
  const serializedPayload = JSON.stringify(
    buildAchievementsWidgetPayload(input)
  );

  useEffect(() => {
    void syncWidget(
      "achievements",
      JSON.parse(serializedPayload) as AchievementsWidgetSyncPayload
    );
  }, [serializedPayload]);
};
