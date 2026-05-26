export function PageLoader({ label = "LOADING NODE" }: { label?: string }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingTop: 8 }}>
      <div
        style={{
          padding: "18px 20px",
          background: "#020202",
          border: "1px solid #151515",
          borderTop: "2px solid #00FF4120",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "#1a2a1a",
            letterSpacing: "0.25em",
            marginBottom: 14,
          }}
        >
          TERMINAL - {label}
        </div>
        {[
          "$ mount --route-chunk --lazy",
          "  [OK] Shell remains resident",
          "  [OK] Fetching encrypted page payload",
          "  [..] Rendering node interface",
        ].map((line, index) => (
          <div
            key={line}
            style={{
              fontSize: 11,
              color: index === 0 ? "#00FF41" : "#2e2e2e",
              lineHeight: 1.9,
              letterSpacing: "0.04em",
              animation: `fade-up 0.25s ease ${index * 0.08}s both`,
            }}
          >
            {line}
          </div>
        ))}
        <span
          style={{
            display: "inline-block",
            color: "#00FF41",
            fontSize: 13,
            animation: "blink-cursor 0.8s step-end infinite",
          }}
        >
          _
        </span>
      </div>
    </div>
  )
}
