'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: custom*0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.16),transparent_26%),radial-gradient(circle_at_50%_75%,rgba(34,197,94,0.10),transparent_30%)]" />
        <motion.div
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[-8rem] top-[8rem] h-[22rem] w-[22rem] rounded-full bg-cyan-500/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-8rem] top-[4rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="sticky top-0 z-30"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-bold text-white shadow-[0_0_30px_rgba(56,189,248,0.18)]">
                  DK
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide text-white">
                    DeKYC Protocol
                  </div>
                  <div className="text-xs text-zinc-400">
                    Decentralized KYC Access Platform
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  User Platform
                </Link>
                <Link
                  href="/service-login"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Consumer Service
                </Link>
                <Link
                  href="/protocol"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Protocol Console
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="relative flex flex-1 items-center py-10 lg:py-14">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.1}
                className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200"
              >
                Hackathon 2026 • Solana • Blockchain Track
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.2}
                className="mt-6 max-w-5xl text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-6xl xl:text-7xl"
              >
                Identity access,
                <span className="block bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                  tokenized and user-controlled
                </span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.3}
                className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg"
              >
                DeKYC lets users verify identity with digital signature, issue
                scoped access permissions, and let external services consume only
                the claims they are explicitly allowed to access.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.4}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/login"
                  className="group rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Launch Platform
                  <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>

                <Link
                  href="/service-login"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open Service Demo
                </Link>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.5}
                className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"
              >
                <MiniStat label="Walletless UX" value="Face + DS" />
                <MiniStat label="Access Control" value="Scoped" />
                <MiniStat label="Response Trust" value="Signed" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-cyan-400/20 via-fuchsia-400/10 to-emerald-400/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_28%,transparent_72%,rgba(255,255,255,0.04))]" />

                <div className="relative">
                  <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                        Live Architecture
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        User → Platform → Permission → Service
                      </div>
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      ACTIVE
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <LayerCard
                      title="User Platform"
                      badge="Identity Setup"
                      description="Biometric mock, digital signature binding, KYC profile, and permission management."
                    />
                    <LayerCard
                      title="Protocol Core"
                      badge="On-Chain Policy"
                      description="Permission PDA state, Token-2022 scope grants, and enforcement by balance checks."
                    />
                    <LayerCard
                      title="Consumer Service"
                      badge="Trusted Access"
                      description="Passwordless login, signed KYC response, and independent signature verification."
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <GlowMetric label="Permission State" value="On-chain" />
                    <GlowMetric label="KYC Storage" value="Encrypted" />
                    <GlowMetric label="Delivery" value="Signed" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function LayerCard({
  title,
  badge,
  description,
}: {
  title: string;
  badge: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-white/10 bg-black/20 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">
            {description}
          </div>
        </div>

        <div className="rounded-full text-center border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
          {badge}
        </div>
      </div>
    </motion.div>
  );
}

function GlowMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}