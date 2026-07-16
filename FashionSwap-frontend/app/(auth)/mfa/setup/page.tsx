import SetupForm from '../../_components/SetupForm';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function MFASetupPage() {
  return (
    <div className="flex h-svh overflow-hidden bg-parchment">
      <div className="flex min-h-0 w-full flex-1 items-center justify-center px-4 py-3 sm:px-6">
        <div className="flex max-h-full w-full max-w-5xl flex-col rounded-[24px] border border-border/80 bg-white p-4 shadow-[0_24px_70px_rgba(53,39,30,0.10)]">
          <div className="flex shrink-0 flex-col gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/profile" className="inline-flex"><Logo size="sm" /></Link>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-charcoal sm:text-3xl">Set up two-step verification</h1>
              <p className="mt-1.5 text-[15px] text-ink">Secure your account by pairing an authenticator app.</p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-terracotta/15 bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta-dark">
              Authenticator app
            </span>
          </div>

          <div className="min-h-0 pt-3">
            <SetupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
