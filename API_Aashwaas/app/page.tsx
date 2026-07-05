import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, Building, ShieldCheck, Smartphone, Users, Globe, BarChart2, TrendingUp } from 'lucide-react';
import { FaTshirt, FaUtensils, FaBook, FaCouch } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 py-4 bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <div>
            <Image src="/images/logo.png" alt="Aashwaas" width={140} height={40} className="object-contain" />
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

      <main className="bg-gradient-to-br from-blue-50 via-blue-200 to-white">
        <div className="max-w-[1600px] mx-auto px-20 bg-[url('/images/landingpage.png')] bg-cover bg-center shadow-2xl min-h-[520px] relative">
          <div className="absolute inset-0 bg-black/80 z-10"></div>
          <div className="absolute inset-0 bg-white/50 z-20 pointer-events-none"></div>
          <div className="grid md:grid-cols-2 gap-8 items-center pt-11 pb-12 relative z-30">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
              Transform Donations into
              <br />
              <span className="block text-blue-400 drop-shadow-lg">Real Impact</span>
            </h1>

            <p className="text-white mb-4 max-w-xl text-lg drop-shadow-lg">Aashwaas bridges donors, volunteers, and NGOs to reduce waste and maximize the impact of every contribution. Donate goods and volunteer your time all in one transparent platform.</p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link href="/donor_login" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow">Donate Now</Link>
              <Link href="/volunteer_login" className="inline-flex items-center gap-3 bg-white border border-blue-600 text-blue-600 px-5 py-3 rounded-full hover:bg-blue-50">Become a Volunteer</Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="7" y="2" width="10" height="20" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Mobile & Web App</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2l7 4v5c0 5-3.2 9.7-7 11-3.8-1.3-7-6-7-11V6l7-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 12.5l1.75 1.75L15 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>100% Transparent</span>
                </div>
            </div>
          </div>

          <div className="relative flex justify-center z-40 mt-8">
            <div className="overflow-hidden shadow-2xl w-full max-w-[760px] h-[420px] md:h-[520px] bg-white rounded-3xl">
              <Image src="/images/landingpage.png" alt="Hero" fill className="w-full h-full object-cover object-center rounded-3xl" />
            </div>
          </div>
          </div>

        </div>
      </main>

      <section id="how-it-works" className="w-full bg-gray-100 py-16">
        <div className="max-w-[1100px] mx-auto text-center mb-10 px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">How Aashwaas Works</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">A simple, transparent process connecting your donations with those who need them most</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Package className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2">List Your Donation</h3>
                <p className="text-sm text-gray-600 text-center">Donors register and list items they wish to donate through our web or mobile platform.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Truck className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2">Volunteer Pickup</h3>
                <p className="text-sm text-gray-600 text-center">Verified volunteers are notified and schedule a convenient pickup time from your location.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Building className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2">Delivered to NGOs</h3>
                <p className="text-sm text-gray-600 text-center">Items are delivered to registered NGOs who distribute them to beneficiaries in need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-you-can-donate" className="w-full py-16 bg-white">
        <div className="max-w-[1100px] mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What You Can Donate</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">We accept a wide range of items to help those in need</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/clothing.jpg" alt="Clothing" width={800} height={420} className="w-full h-[160px] object-cover rounded-lg" />
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
                <Image src="/images/food.jpg" alt="Food" width={800} height={420} className="w-full h-[160px] object-cover rounded-lg" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaUtensils className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Food</h3>
                <p className="text-sm text-gray-600 text-center">Non-perishable food items and packaged goods</p>
              </div>
            </div>

            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/Stationery.jpg" alt="Stationery" width={800} height={420} className="w-full h-[160px] object-cover rounded-lg" />
              </div>
              <div className="-mt-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <FaBook className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Stationery</h3>
                <p className="text-sm text-gray-600 text-center">Books, notebooks, pens, and educational materials</p>
              </div>
            </div>

            <div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/images/furniture.jpg" alt="Furniture" width={800} height={420} className="w-full h-[160px] object-cover rounded-lg" />
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why Choose Aashwaas?</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Built with transparency, efficiency, and impact in mind</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">100% Transparent</h4>
                <p className="text-sm text-gray-600">Track your donation from pickup to delivery with real-time updates</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Mobile & Web Access</h4>
                <p className="text-sm text-gray-600">Manage donations anytime, anywhere with our cross-platform apps</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Verified Network</h4>
                <p className="text-sm text-gray-600">All volunteers and NGOs are thoroughly verified for your peace of mind</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Impact Analytics</h4>
                <p className="text-sm text-gray-600">See the real-world impact of your contributions with detailed reports</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Zero Waste Goal</h4>
                <p className="text-sm text-gray-600">Maximize resource utilization and minimize waste in the donation process</p>
              </div>
            </div>

            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      <section id="ready-to-make-difference" className="w-full py-16 bg-gradient-to-br from-blue-50 via-blue-200 to-white">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Ready to Make a Difference?</h2>
          <p className="mt-3 max-w-2xl mx-auto text-gray-600">Join thousands of donors, volunteers, and organizations creating positive change</p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/donor_register" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"> 
              Start Donating
            </Link>

            <Link href="/volunteer_register" className="inline-flex items-center gap-3 bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50"> 
              Join as Volunteer
            </Link>
          </div>
        </div>
      </section>

      <footer id="site-footer" className="w-full bg-gray-800 text-gray-200 py-6">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="flex-shrink-0">
              <Image src="/images/logo.png" alt="Aashwaas" width={120} height={34} className="object-contain" />
            </div>
            <p className="mt-2 text-xs text-gray-400 max-w-xs">Connecting donors, volunteers and NGOs to create measurable social impact.</p>
            <div className="text-xs text-gray-400 text-center md:text-right">
              <p>© {new Date().getFullYear()} Aashwaas. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}