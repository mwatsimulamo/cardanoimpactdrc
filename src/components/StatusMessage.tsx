const tones = {
  warning: "border-warning bg-warning-surface text-warning",
  neutral: "border-line bg-surface text-ink",
  danger: "border-danger bg-danger-surface text-danger",
  success: "border-success bg-success-surface text-success",
} as const;

export function StatusMessage({
  id,
  tone = "neutral",
  children,
}: {
  id?: string;
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      role="status"
      className={`border px-5 py-4 text-[0.9375rem] leading-[1.5] ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
