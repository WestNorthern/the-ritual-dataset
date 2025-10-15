export function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>The Ritual Dataset</h1>
      <p>Step 0 scaffold is alive! ✨</p>

      <footer style={{ marginTop: 24, opacity: 0.7 }}>
        build {typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__.slice(0, 7) : "dev"}
      </footer>
    </main>
  );
}
