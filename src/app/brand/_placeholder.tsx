export function BrandPlaceholder({ title }: { title: string }) {
  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-neutral-600">This screen lands in a later step.</p>
    </section>
  );
}
