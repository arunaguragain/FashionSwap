import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, Building, ShieldCheck, Smartphone, Users, BarChart2, TrendingUp } from 'lucide-react';
import { FaTshirt, FaUtensils, FaBook, FaCouch } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 py-4 bg-white shadow-sm">
        <div className="mx-auto flex max-w-400 items-center justify-between px-6">
          <div>
            <Image src="/images/logo.png" alt="FashionSwap" width={140} height={40} className="object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#how-it-works" className="hover:text-gray-900">How It Works</Link>
            <Link href="#what-you-can-donate" className="hover:text-gray-900">Categories</Link>
            <Link href="/admin_login" aria-label="Admin portal" className="ml-2 inline-flex items-center gap-2 text-sm text-purple-600 group transition px-2 py-1 hover:bg-purple-50">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline text-current transition-colors duration-200">Admin Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="bg-linear-to-br from-blue-50 via-blue-200 to-white">
        <div className="relative mx-auto min-h-130 max-w-400 bg-[url('/images/landingpage.png')] bg-cover bg-center px-20 shadow-2xl">
          <div className="absolute inset-0 bg-black/80 z-10"></div>
          <div className="absolute inset-0 bg-white/50 z-20 pointer-events-none"></div>
          <div className="grid md:grid-cols-2 gap-8 items-center pt-11 pb-12 relative z-30">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-300" />
              Buy, sell, and discover pre-loved style
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
              Refresh your closet with
              <br />
              <span className="block text-blue-300 drop-shadow-lg">pieces you’ll actually love</span>
            </h1>

            <p className="text-white/90 mb-5 max-w-xl text-lg drop-shadow-lg">FashionSwap makes it easy to browse curated pre-loved fashion, list your own finds, and complete every exchange with clarity and care.</p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link href="/register" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow transition">Start Selling</Link>
              <Link href="/listings" className="inline-flex items-center gap-3 bg-white border border-blue-600 text-blue-600 px-5 py-3 rounded-full hover:bg-blue-50 transition">Browse Listings</Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
              <div className="rounded-full bg-white/10 px-3 py-1">Trusted community</div>
              <div className="rounded-full bg-white/10 px-3 py-1">Verified listings</div>
              <div className="rounded-full bg-white/10 px-3 py-1">Sustainable choices</div>
            </div>
          </div>

          <div className="relative flex justify-center z-40 mt-8">
            <div className="relative h-105 w-full max-w-190 overflow-hidden rounded-3xl bg-white shadow-2xl md:h-130">
              <Image src="/images/landingpage.png" alt="Hero" fill className="h-full w-full rounded-3xl object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Now trending</p>
                <p className="mt-2 text-xl font-semibold">Fresh finds from local sellers</p>
                <p className="mt-1 text-sm text-white/80">Explore standout pieces that feel new again.</p>
              </div>
            </div>
          </div>
          </div>

        </div>
      </main>

      <section id="how-it-works" className="w-full bg-gray-100 py-16">
        <div className="max-w-[1100px] mx-auto text-center mb-10 px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">A simpler way to shop secondhand</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">From first browse to final handoff, everything is designed to feel clear, easy, and genuinely trustworthy.</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Package className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2">Create a Listing</h3>
                <p className="text-sm text-gray-600 text-center">Sellers share clothing and accessories with clear details, photos, and pricing.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Truck className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2">Connect With Buyers</h3>
                <p className="text-sm text-gray-600 text-center">Buyers browse listings, send offers, and chat directly with the seller.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Building className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2">Complete the Exchange</h3>
                <p className="text-sm text-gray-600 text-center">Orders are confirmed and completed through a simple, trust-first transaction flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-you-can-donate" className="w-full py-16 bg-white">
        <div className="max-w-[1100px] mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What You Can List</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">A wide range of fashion pieces and accessories ready for a second life</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/clothing.jpg" alt="Clothing" width={800} height={420} className="h-40 w-full rounded-lg object-cover" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaTshirt className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Clothing</h3>
                <p className="text-sm text-gray-600 text-center">Gently used clothes, shoes, and accessories for all ages</p>
              </div>
            </div>

            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/food.jpg" alt="Food" width={800} height={420} className="h-40 w-full rounded-lg object-cover" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaUtensils className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accessories</h3>
                <p className="text-sm text-gray-600 text-center">Bags, belts, jewelry, and small style accents</p>
              </div>
            </div>

            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/Stationery.jpg" alt="Stationery" width={800} height={420} className="h-40 w-full rounded-lg object-cover" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaBook className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Vintage Finds</h3>
                <p className="text-sm text-gray-600 text-center">Unique pieces, statement items, and timeless classics</p>
              </div>
            </div>

            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/furniture.jpg" alt="Furniture" width={800} height={420} className="h-40 w-full rounded-lg object-cover" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaCouch className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Furniture</h3>
                <p className="text-sm text-gray-600 text-center">Household furniture and home essentials in good condition</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose" className="w-full bg-gray-50 py-16">
        <div className="max-w-[1100px] mx-auto text-center mb-10 px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Why Choose FashionSwap?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">Built with transparency, efficiency, and community trust in mind.</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Trusted Transactions</h4>
                <p className="text-sm text-gray-600">Track each listing and order with clear updates from posting to pickup</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Mobile & Web Access</h4>
                <p className="text-sm text-gray-600">Manage listings and orders anytime, anywhere from any device</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Verified Community</h4>
                <p className="text-sm text-gray-600">Sellers and buyers are reviewed and supported by a trusted network</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Marketplace Insights</h4>
                <p className="text-sm text-gray-600">See your activity clearly with simple insights into your listings and orders</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Circular Style</h4>
                <p className="text-sm text-gray-600">Extend the life of great pieces and reduce waste through resale</p>
              </div>
            </div>

            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      <section id="ready-to-make-difference" className="w-full bg-linear-to-br from-blue-50 via-blue-200 to-white py-16">
        <div className="mx-auto max-w-275 px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Ready to Refresh Your Wardrobe?</h2>
          <p className="mt-3 max-w-2xl mx-auto text-gray-600">Join thousands of style-conscious shoppers and sellers building a more sustainable closet</p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"> 
              Join FashionSwap
            </Link>

            <Link href="/listings" className="inline-flex items-center gap-3 bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50"> 
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      <footer id="site-footer" className="w-full bg-gray-800 text-gray-200 py-6">
        <div className="mx-auto max-w-275 px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start">
            <div className="shrink-0">
              <Image src="/images/logo.png" alt="FashionSwap" width={120} height={34} className="object-contain" />
            </div>
            <p className="mt-2 max-w-xs text-xs text-gray-400">A trusted marketplace for buying, selling, and discovering preloved fashion with confidence.</p>
            <div className="text-center text-xs text-gray-400 md:text-right">
              <p>© {new Date().getFullYear()} FashionSwap. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}