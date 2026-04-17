export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Suppress the root Footer for all design tool pages so the
  // full-screen 3D viewport can fill the remaining height.
  return <>{children}</>;
}
