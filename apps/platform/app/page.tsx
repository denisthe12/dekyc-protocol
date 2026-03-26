import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl">
          <div className="grid gap-10 px-8 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
            <div>
              <div className="inline-flex rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Hackathon 2026 • Blockchain Track
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                Decentralized KYC Access Protocol
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                A user-controlled identity platform where KYC access is issued as
                scoped, signed, and token-backed permissions powered by Solana and
                Token-2022.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Open User Platform
                </Link>

                <Link
                  href="/service-login"
                  className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Open Consumer Service
                </Link>

                <Link
                  href="/protocol"
                  className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Open Protocol Console
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <FeatureCard
                title="User-Owned Access"
                description="Users explicitly control which identity claims a service may access."
              />
              <FeatureCard
                title="Scoped Capability Tokens"
                description="Each permission scope is backed by Token-2022 capability tokens and balance checks."
              />
              <FeatureCard
                title="Signed KYC Delivery"
                description="Services receive cryptographically signed responses and can independently verify them."
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{description}</div>
    </div>
  );
}