export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#f6f3f2",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  );
}
