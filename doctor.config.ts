import type { ReactDoctorConfig } from "react-doctor/api";

// noinspection JSUnusedGlobalSymbols
export default {
  ignore: {
    // no-giant-component flags large but cohesive orchestrator screens on purpose.
    // deslop/unused-file false-flags Pages Functions, which are routed by file path, not imported.
    rules: ["react-doctor/no-giant-component", "deslop/unused-file"],
    overrides: [
      {
        // Uses a seeded PRNG for decorative particle placement, not anything security-sensitive.
        files: ["**/src/components/backgrounds/TajinRain.tsx"],
        rules: ["react-doctor/insecure-crypto-risk"],
      },
      {
        // Cleanup already clears every timer/interval pushed into local arrays; the rule
        // can't trace timers registered inside nested closures.
        files: ["**/src/components/screens/AchievementReveal.tsx"],
        rules: ["react-doctor/effect-needs-cleanup"],
      },
      {
        // State setters here run inside timers/async callbacks for deferred UI updates,
        // not as pure derivations during render.
        files: [
          "**/src/App.tsx",
          "**/src/components/backgrounds/DuckParade.tsx",
          "**/src/components/modals/ChallengeCreatorModal.tsx",
          "**/src/components/modals/SettingsModal.tsx",
          "**/src/context/AlertContext.tsx",
          "**/src/hooks/useAchievements.ts",
        ],
        rules: ["react-doctor/no-impure-state-updater"],
      },
      {
        // Tiny pixel-font labels are an intentional part of the retro badge styling.
        files: ["**/src/components/modals/InfoModal.tsx"],
        rules: ["react-doctor/no-tiny-text"],
      },
      {
        // List positions are fixed board/grid slots that never reorder, so index keys are safe.
        files: [
          "**/src/components/grid/CompletedRow.tsx",
          "**/src/components/grid/Grid.tsx",
          "**/src/components/grid/GridRows.tsx",
          "**/src/components/stats/Histogram.tsx",
          "**/src/components/screens/WinCelebration.tsx",
        ],
        rules: ["react-doctor/no-array-index-as-key"],
      },
      {
        // setCellColors here reads the cellColors own prior state (auto-gray
        // overrides manual paint; auto-green fills only the newest row).
        files: ["**/src/hooks/useTilePainting.ts"],
        rules: ["react-doctor/no-pass-data-to-parent"],
      },
      {
        // These booleans are independent, freely-combinable settings/state,
        // not mutually-exclusive modes, so no enum split applies here.
        files: [
          "**/src/components/modals/SettingsModal.tsx",
          "**/src/components/modals/StatsModal.tsx",
          "**/src/components/screens/GameModals.tsx",
        ],
        rules: ["react-doctor/no-many-boolean-props"],
      },
      {
        // The effect already returns a cleanup that clears its own
        // timeoutId, and cancelAlert() clears AlertContext's own timers.
        files: ["**/src/hooks/useGameOutcome.ts"],
        rules: ["react-doctor/effect-needs-cleanup"],
      },
      {
        // Loads local audio assets for the WebAudio API, not app data for
        // rendering. Already deduped/cached at module scope and guarded by
        // an active flag so results are dropped after unmount.
        files: ["**/src/components/backgrounds/Fireworks.tsx"],
        rules: ["react-doctor/no-fetch-in-effect"],
      },
    ],
  },
} satisfies ReactDoctorConfig;
