import { useEffect } from "react";
import {
  buildStatsWidgetPayload,
  type StatsWidgetInput,
} from "../lib/statsWidget";
import { syncWidget } from "../lib/widgetSync";

export const useStatsWidgetSync = (input: StatsWidgetInput) => {
  const serializedPayload = JSON.stringify(buildStatsWidgetPayload(input));

  useEffect(() => {
    void syncWidget(
      "stats",
      JSON.parse(serializedPayload) as StatsWidgetSyncPayload
    );
  }, [serializedPayload]);
};
