import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Decentralized KYC Access Protocol
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          User-controlled identity, scoped data disclosure, and tokenized access
          permissions powered by Solana and Token-2022.
        </p>

        {/* Highlights */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature
            title="User-Owned Identity"
            desc="KYC derived from EDS, stored securely, controlled by the user."
          />
          <Feature
            title="Scoped Access"
            desc="Services receive only specific claims via explicit user consent."
          />
          <Feature
            title="Tokenized Permissions"
            desc="Access rights are enforced using on-chain capability tokens."
          />
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/permissions"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Open Dashboard
          </Link>

          <Link
            href="/protocol"
            className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            View Protocol Monitor
          </Link>

          <Link
            href="/demo-flow"
            className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Open Demo Flow
          </Link>

          <Link
            href="/service-login"
            className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Open Consumer Service
          </Link>
        </div>

        {/* Tech line */}
        <div className="mt-16 text-xs text-zinc-500">
          Built with Next.js • NestJS • Solana • Anchor • Token-2022
        </div>
      </div>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-zinc-400">{desc}</div>
    </div>
  );
}