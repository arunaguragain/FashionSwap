"use client";

import React from "react";


export default function TermsPage() {
  return (
    <div className="w-full px-6 py-10 md:px-8">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>
        Terms of Service
      </h1>
      <p className="text-sm text-ink mb-10">Last updated: July 2025</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-ink">
        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FashionSwap, you agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the platform. FashionSwap reserves the right to update these terms at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. User Accounts</h2>
          <p>
            You must create an account to buy or sell items on FashionSwap. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities that occur under your account. You must
            provide accurate and complete information during registration.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. Listings &amp; Transactions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sellers are responsible for the accuracy of their listing descriptions, photos, and pricing.</li>
            <li>All items must be legal to sell and must be accurately described regarding condition.</li>
            <li>Once a seller accepts an order, it cannot be cancelled by either party.</li>
            <li>FashionSwap acts as a marketplace and is not a party to transactions between buyers and sellers.</li>
            <li>All payments are handled directly between buyer and seller (cash on delivery).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">4. Prohibited Items</h2>
          <p>The following items may not be listed on FashionSwap:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Counterfeit or replica goods</li>
            <li>Stolen property</li>
            <li>Items that violate any applicable law or regulation</li>
            <li>Weapons, hazardous materials, or controlled substances</li>
            <li>Items with inappropriate or offensive content</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">5. User Conduct</h2>
          <p>Users agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Harass, threaten, or abuse other users</li>
            <li>Create multiple accounts for deceptive purposes</li>
            <li>Manipulate prices or interfere with other users' listings</li>
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to bypass any security features of the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">6. Limitation of Liability</h2>
          <p>
            FashionSwap is provided "as is" without any warranties. We are not responsible for the quality, safety,
            or legality of items listed on the platform, nor for the accuracy of listings. We are not liable for any
            disputes between buyers and sellers, including issues related to delivery, item condition, or payment.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">7. Account Termination</h2>
          <p>
            FashionSwap reserves the right to suspend or terminate any account that violates these terms, engages in
            fraudulent activity, or is otherwise detrimental to the community. Users may also delete their own accounts
            at any time through the Settings page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">8. Contact</h2>
          <p>
            For questions about these Terms of Service, please reach out to{" "}
            <a href="mailto:support@fashionswap.com.np" className="text-terracotta hover:text-terracotta-dark font-medium">
              support@fashionswap.com.np
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
