export function MiaBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-28 w-28 text-5xl" : size === "sm" ? "h-12 w-12 text-2xl" : "h-16 w-16 text-3xl";
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-orange-100 shadow-soft ring-4 ring-white`}
      aria-label="Mia the cat"
    >
      🐱
    </div>
  );
}
