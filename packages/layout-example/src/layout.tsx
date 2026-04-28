import { Outlet } from "react-router";

export default function ExampleLayout() {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <header
        style={{
          padding: "1rem",
          background: "#f0f0f0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1>Example App</h1>
      </header>
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
