"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const spinnerSizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function Spinner({ size = "md" }: SpinnerProps): React.ReactElement {
  return (
    <span
      className={`inline-block ${spinnerSizes[size]} animate-spin rounded-full border-2 border-teal-600 border-t-transparent`}
    />
  );
}
