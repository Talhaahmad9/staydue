"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-3 h-3",
};

const gaps = {
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
};

export default function Spinner({ size = "md" }: SpinnerProps): React.ReactElement {
  return (
    <span className={`flex items-center ${gaps[size]}`}>
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className={`${sizes[size]} rounded-full bg-brand animate-dot-pulse`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
