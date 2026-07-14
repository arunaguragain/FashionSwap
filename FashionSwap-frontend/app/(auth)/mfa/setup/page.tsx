import SetupForm from '../../_components/SetupForm';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function MFASetupPage() {
  return (
    <div className="min-h-screen bg-parchment flex">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="mb-8">
          <Link href="/"><Logo size="sm" /></Link>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal">Set up two-step verification</h1>
          <p className="text-ink mt-2 text-[15px]">Secure your account by pairing an authenticator app.</p>
        </div>

        <SetupForm />
      </div>
    </div>
  );
}
