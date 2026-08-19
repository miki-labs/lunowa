type BootstrapProofProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
};

export function BootstrapProof({
  eyebrow,
  title,
  description,
  status
}: BootstrapProofProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section
        aria-labelledby="bootstrap-title"
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8 shadow-sm"
        data-testid="bootstrap-proof"
      >
        <p className="text-sm font-semibold tracking-[0.18em] text-lunar-gold uppercase">
          {eyebrow}
        </p>
        <h1
          id="bootstrap-title"
          className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 rounded-2xl bg-brand-navy px-5 py-4 text-sm text-white">
          {status}
        </div>
      </section>
    </main>
  );
}
