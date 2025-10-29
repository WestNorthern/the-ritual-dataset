export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`rounded-xl px-3 py-1 text-sm font-medium transition ${
        active ? "bg-black text-white" : "bg-black/5 text-gray-900 hover:bg-black/10"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}