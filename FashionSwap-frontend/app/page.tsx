import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building, BookOpen, Package, ShieldCheck, Smartphone, Sofa, Sparkles, Shirt, TrendingUp, Truck, Users } from 'lucide-react';

const cards = [
  { title: 'Clothing', description: 'Gently used clothes, shoes, and accessories for all ages.', icon: Shirt, image: '/images/clothing.jpg' },
  { title: 'Accessories', description: 'Bags, belts, jewelry, and small style accents.', icon: BookOpen, image: '/images/Stationery.jpg' },
  { title: 'Furniture', description: 'Household furniture and home essentials in good condition.', icon: Sofa, image: '/images/furniture.jpg' },
];

const steps = [
  { title: 'Create a listing', description: 'Share your find with details, photos, and pricing in minutes.', icon: Package },
  { title: 'Connect with buyers', description: 'Browse, send offers, and chat directly with the people behind each piece.', icon: Truck },
  { title: 'Complete the exchange', description: 'Move from offer to handoff through a calm, guided process.', icon: Building },
];

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth bg-transparent">
      <header className="sticky top-0 z-50 border-b border-outline/10 bg-surface-container-lowest/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="FashionSwap" width={140} height={40} className="object-contain" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-on-surface-variant md:flex">
            <Link href="#how-it-works" className="transition hover:text-primary">How It Works</Link>
            <Link href="#categories" className="transition hover:text-primary">Categories</Link>
            <Link href="/admin_login" aria-label="Admin portal" className="inline-flex items-center gap-2 rounded-full border border-primary/15 px-3 py-2 text-primary transition hover:bg-primary/5">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="overflow-hidden rounded-[2rem] border border-outline/15 bg-surface-container-lowest shadow-[0_24px_80px_rgba(27,28,25,0.08)]">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="px-6 py-10 sm:px-10 lg:px-12 lg:py-16">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Buy, sell, and discover pre-loved style
                </div>
                <h1 className="font-headline text-4xl leading-tight text-on-surface sm:text-5xl lg:text-6xl">
                  Refresh your closet with pieces you&apos;ll actually love.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
                  FashionSwap brings a calm, curated marketplace to every exchange, from first browse to final handoff.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition hover:-translate-y-0.5">
                    Start Selling <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/listings" className="inline-flex items-center gap-2 rounded-full border border-outline/30 bg-surface-container-low px-6 py-3 text-sm font-semibold text-primary transition hover:bg-surface-container">
                    Browse listings
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-on-surface-variant">
                  <span className="rounded-full border border-outline/20 bg-surface-container-low px-3 py-2">Trusted community</span>
                  <span className="rounded-full border border-outline/20 bg-surface-container-low px-3 py-2">Verified listings</span>
                  <span className="rounded-full border border-outline/20 bg-surface-container-low px-3 py-2">Sustainable choices</span>
                </div>
              </div>
              <div className="relative h-[420px] w-full lg:h-[560px]">
                <Image src="/images/landingpage.png" alt="Curated fashion finds" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-primary-container">
                    <BadgeCheck className="h-4 w-4" />
                    New arrivals
                  </div>
                  <p className="mt-3 text-2xl font-semibold">Fresh finds from local sellers</p>
                  <p className="mt-2 max-w-md text-sm text-white/80">Discover statement pieces that feel new again and ready for a second life.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">A calmer way to shop secondhand</p>
            <h2 className="mt-4 font-headline text-3xl text-on-surface sm:text-4xl">From first browse to final handoff, every step feels clear and trusted.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest p-7 shadow-[0_10px_30px_rgba(27,28,25,0.04)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-on-surface">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-on-surface-variant">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Browse by category</p>
              <h2 className="mt-2 font-headline text-3xl text-on-surface sm:text-4xl">A collection of warm, well-loved pieces.</h2>
            </div>
            <Link href="/listings" className="text-sm font-semibold text-primary">See the full marketplace →</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.title} href={`/listings?category=${encodeURIComponent(card.title)}`} className="group overflow-hidden rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest shadow-[0_10px_30px_rgba(27,28,25,0.04)]">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={card.image} alt={card.title} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-on-surface">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">{card.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-8 shadow-[0_16px_50px_rgba(27,28,25,0.06)] sm:p-10 lg:p-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why FashionSwap?</p>
                <h2 className="mt-3 font-headline text-3xl text-on-surface sm:text-4xl">Built for trust, transparency, and community care.</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">A more thoughtful marketplace for your wardrobe, where each handoff feels considered and each detail is easier to follow.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Trusted transactions', description: 'Track offers and order updates from posting to pickup.', icon: ShieldCheck },
                  { title: 'Verified community', description: 'Supportive seller and buyer reviews underpin every exchange.', icon: Users },
                  { title: 'Calm mobile experience', description: 'Manage your listings and orders on the go with ease.', icon: Smartphone },
                  { title: 'Circular style', description: 'Keep great pieces in circulation and give them a new chapter.', icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[1rem] border border-outline/15 bg-surface-container-low p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-on-surface">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline/10 bg-surface-container-lowest/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-sm text-on-surface-variant sm:flex-row sm:text-left lg:px-8">
          <Image src="/images/logo.png" alt="FashionSwap" width={120} height={34} className="object-contain" />
          <p>A trusted marketplace for buying, selling, and discovering preloved fashion with confidence.</p>
          <p>© {new Date().getFullYear()} FashionSwap</p>
        </div>
      </footer>
    </div>
  );
}