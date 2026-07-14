import Link from 'next/link';
import Logo from '@/components/Logo';
import RegisterForm from '../_components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-parchment flex">
      <div className="hidden lg:block lg:w-[45%] relative bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=1200&fit=crop&auto=format"
          alt="Fashion marketplace"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-2xl font-bold text-parchment" style={{ letterSpacing: '-0.02em' }}>
            Join 4,800+ sellers already listing on FashionSwap
          </p>
          <p className="text-parchment/60 text-sm mt-3">No fees. No commissions. Just direct connections.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="mb-8">
          <Link href="/"><Logo size="sm" /></Link>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p className="text-ink mt-2 text-[15px]">
            Already have one?{' '}
            <Link href="/login" className="text-terracotta font-medium hover:text-terracotta-dark">Sign in</Link>
          </p>
        </div>

        <RegisterForm userType="User" loginLink="/login" />

        <p className="text-xs text-center text-ink/60 mt-6">
          By creating an account, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

