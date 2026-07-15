import type { ReactDoctorConfig } from "react-doctor/api";

// noinspection JSUnusedGlobalSymbols
export default {
  ignore: {
    rules: ["react-doctor/no-giant-component", "deslop/unused-file"],
    overrides: [
      {
        files: ["src/components/backgrounds/TajinRain.tsx"],
        rules: ["react-doctor/insecure-crypto-risk"],
      },
      {
        files: ["src/components/screens/AchievementReveal.tsx"],
        rules: ["react-doctor/effect-needs-cleanup"],
      },
      {
        files: [
          "src/App.tsx",
          "src/components/backgrounds/DuckParade.tsx",
          "src/components/modals/ChallengeCreatorModal.tsx",
          "src/components/modals/SettingsModal.tsx",
          "src/context/AlertContext.tsx",
          "src/hooks/useAchievements.ts",
        ],
        rules: ["react-doctor/no-impure-state-updater"],
      },
      {
        files: [
          "src/lib/achievements.ts",
          "src/lib/backgrounds.ts",
          "src/lib/localStorage.ts",
        ],
        rules: ["react-doctor/client-localstorage-no-version"],
      },
      {
        files: ["src/components/modals/InfoModal.tsx"],
        rules: ["react-doctor/no-tiny-text"],
      },
      {
        files: [
          "src/components/grid/CompletedRow.tsx",
          "src/components/grid/Grid.tsx",
          "src/components/grid/GridRows.tsx",
          "src/components/stats/Histogram.tsx",
          "src/components/screens/WinCelebration.tsx",
        ],
        rules: ["react-doctor/no-array-index-as-key"],
      },
      {
        // setCellColors here reads the cellColors own prior state (auto-gray
        // overrides manual paint; auto-green fills only the newest row).
        files: ["src/hooks/useTilePainting.ts"],
        rules: ["react-doctor/no-pass-data-to-parent"],
      },
      {
        // These booleans are independent, freely-combinable settings/state,
        // not mutually-exclusive modes, so no enum split applies here.
        files: [
          "src/components/modals/SettingsModal.tsx",
          "src/components/modals/StatsModal.tsx",
          "src/components/screens/GameModals.tsx",
        ],
        rules: ["react-doctor/no-many-boolean-props"],
      },
    ],
  },
} satisfies ReactDoctorConfig;
