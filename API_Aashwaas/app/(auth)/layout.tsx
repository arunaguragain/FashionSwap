"use client";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, Users, Heart, ArrowLeft, BarChart2, Clock, ClipboardList, Award, Check } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

const USER_CONFIGS = {
  admin: {
    icon: Shield,
    colors: {
      gradient: "from-purple-600 via-violet-600 to-indigo-700",
      bg: "from-purple-200 via-purple-300 to-purple-100",
      heading: "text-purple-900",
      body: "text-purple-800",
      feature: "text-purple-700",
      border: "border-purple-200",
    },
    content: {
      login: "Welcome Back, Admin!",
      register: "Create Admin Account",
      description: "Manage the donation ecosystem with comprehensive oversight and control.",
    },
    features: [
      { text: 'Complete NGO management', icon: <Users className="w-5 h-5 text-purple-700" /> },
      { text: 'Real-time analytics dashboard', icon: <BarChart2 className="w-5 h-5 text-purple-700" /> },
      { text: 'Advanced security protocols', icon: <Shield className="w-5 h-5 text-purple-700" /> }
    ]
  },
  volunteer: {
    icon: Users,
    colors: {
      gradient: "from-green-600 via-emerald-600 to-teal-700",
      bg: "from-green-100 via-emerald-100 to-teal-100",
      heading: "text-emerald-900",
      body: "text-emerald-800",
      feature: "text-emerald-700",
      border: "border-emerald-200",
    },
    content: {
      login: "Welcome Back, Volunteer!",
      register: "Join as a Volunteer",
      description: "Join our community of dedicated volunteers making real change happen.",
    },
    features: [
      { text: 'Flexible task management', icon: <ClipboardList className="w-5 h-5 text-emerald-700" /> },
      { text: 'Track volunteer hours & impact', icon: <Clock className="w-5 h-5 text-emerald-700" /> },
      { text: 'Community recognition', icon: <Award className="w-5 h-5 text-emerald-700" /> }
    ]
  },
  donor: {
    icon: Heart,
    colors: {
      gradient: "from-blue-600 via-cyan-600 to-sky-700",
      bg: "from-sky-100 via-cyan-100 to-blue-100",
      heading: "text-sky-900",
      body: "text-sky-800",
      feature: "text-sky-700",
      border: "border-sky-200",
    },
    content: {
      login: "Welcome Back, Donor!",
      register: "Become a Donor",
      description: "Transform lives through your generous donations to verified organizations.",
    },
    features: [
      { text: 'Easy donation tracking', icon: <Heart className="w-5 h-5 text-sky-700" /> },
      { text: 'Verified NGO network', icon: <Check className="w-5 h-5 text-sky-700" /> },
      { text: 'Impact visualization', icon: <BarChart2 className="w-5 h-5 text-sky-700" /> }
    ]
  }
} as const;

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const userType = pathname?.includes('admin') ? 'admin' 
    : pathname?.includes('volunteer') ? 'volunteer' 
    : 'donor';
  const isLogin = pathname?.includes('login');
  
  const config = USER_CONFIGS[userType];
  const IconComponent = config.icon;
  const colors = config.colors;
  const title = isLogin ? config.content.login : config.content.register;

  return (
    <div className="h-screen overflow-hidden overflow-x-hidden flex bg-gradient-to-br from-gray-50 to-gray-100">
      <div className={`hidden lg:flex lg:w-1/2 xl:w-[45%] bg-gradient-to-br ${colors.bg} relative overflow-hidden h-full`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)',
            backgroundSize: '56px 56px'
          }} />
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full py-9 px-9 w-full">
          <div className="mb-12">
            <Image src="/images/logo.png" alt="logo" width={190} height={40} className="object-contain drop-shadow-sm" priority />
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h1 className={`text-3xl font-bold leading-tight mb-3 tracking-tight ${colors.heading}`}>{title}</h1>
              <p className={`text-sm leading-relaxed ${colors.body}`}>{config.content.description}</p>
            </div>

            <div className="space-y-7">
              {config.features.map((feature, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-2xl p-2.5 border ${colors.border} bg-white/95 hover:shadow-lg transition-all group`}>
                  <div className="text-xl shrink-0 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <span className={`${colors.feature} font-medium`}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center justify-between text-sm text-black/60">
            <span>© 2025 आश्वास</span>
          </div>
        </div>
      </div>

      <div className={`flex-1 h-full ${isLogin ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
        <div className="min-h-full flex flex-col">
          <div className="p-4 lg:p-5 relative z-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/');
              }}
              type="button"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}