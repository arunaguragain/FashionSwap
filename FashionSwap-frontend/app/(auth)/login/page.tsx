import Link from 'next/link';
import Logo from '@/components/Logo';
import LoginForm from '../_components/LoginForm';

export default function LoginPage() {
  return (
    <div className="h-screen bg-parchment flex overflow-hidden">
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-[45%] h-full relative bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=1200&fit=crop&auto=format"
          alt="Fashion"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-2xl font-bold text-parchment leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Pre-loved fashion, new stories.
          </p>
          <p className="text-parchment/60 text-sm mt-3">Buy and sell second-hand fashion directly in your city.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 h-full flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <div className="mb-6">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p className="text-ink mt-1.5 text-[15px]">
            New here?{' '}
            <Link href="/register" className="text-terracotta font-medium hover:text-terracotta-dark transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <LoginForm userType="User" registerLink="/register" forgotPasswordLink="/forgot-password" showGoogleSignIn={true} />

        <p className="text-xs text-center text-ink/60 mt-6">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
