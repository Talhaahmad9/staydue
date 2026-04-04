"use client";

export default function ButtonLoader(): React.ReactElement {
  return (
    <span className="flex items-center gap-1">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-current animate-dot-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
