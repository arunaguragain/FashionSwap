import Link from 'next/link';
import Logo from '@/components/Logo';
import LoginForm from '../_components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-[45%] relative bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
          alt="Fashion"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-2xl font-bold text-parchment leading-tight" style={{ letterSpacing: '-0.02em' }}>
            "Found my dream saree for Rs. 3,500 — brand new condition."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-terracotta/40 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-parchment">Priya Maharjan</p>
              <p className="text-xs text-parchment/60">Buyer · Lalitpur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="mb-8">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p className="text-ink mt-2 text-[15px]">
            New here?{' '}
            <Link href="/register" className="text-terracotta font-medium hover:text-terracotta-dark transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <LoginForm userType="User" registerLink="/register" forgotPasswordLink="/forgot-password" showGoogleSignIn={true} />

        <p className="text-xs text-center text-ink/60 mt-8">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
