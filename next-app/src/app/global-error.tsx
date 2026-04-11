"use client";

/**
 * Replaces the root layout when an error bubbles past `app/error.tsx`.
 * Must define its own `html` / `body` (Next.js); keep styles self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const detail =
    isDev && error.message?.trim()
      ? error.message
      : "Something went wrong. Please try again, or return to the site in a moment.";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080c",
          color: "#f5eee3",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: "36rem",
            textAlign: "center",
            padding: "2rem",
            borderRadius: "1.25rem",
            border: "1px solid rgba(214,168,95,0.2)",
            background: "rgba(8,10,14,0.85)",
          }}
        >
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", color: "#b8ab95" }}>
            Mystique
          </p>
          <h1 style={{ marginTop: "1rem", fontSize: "1.75rem", fontWeight: 600 }}>
            We could not load the application.
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", lineHeight: 1.5, color: "#b8ab95" }}>
            {detail}
          </p>
          {error.digest ? (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#7a7265" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              background: "linear-gradient(90deg, #d6a85f, #f0d19a)",
              color: "#0a0c10",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
