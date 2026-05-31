export const BackgroundGrid = () => (
  <div
    className="fixed inset-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px),
        linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "16px 16px",
    }}
  />
);
