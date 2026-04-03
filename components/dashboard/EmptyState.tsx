interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps): React.ReactElement {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </section>
  );
}
