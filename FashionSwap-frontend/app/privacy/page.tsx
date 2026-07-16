"use client";

import React from "react";


export default function PrivacyPage() {
  return (
    <div className="w-full px-6 py-10 md:px-8">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>
        Privacy Policy
      </h1>
      <p className="text-sm text-ink mb-10">Last updated: July 2025</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-ink">
        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Information We Collect</h2>
          <p>
            When you create an account on FashionSwap, we collect personal information such as your name, email address,
            phone number, and location. When you place an order, we also collect delivery address details. We may also
            collect usage data such as pages visited and actions taken within the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Facilitate buying and selling of items on the platform</li>
            <li>Send order notifications and updates via email</li>
            <li>Improve the user experience and platform performance</li>
            <li>Communicate important service announcements</li>
            <li>Ensure the security and integrity of the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. Information Sharing</h2>
          <p>
            We do not sell your personal information to third parties. Your delivery address is shared only with the
            seller of the item you purchased to facilitate order fulfilment. We may share information with law enforcement
            if required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including encrypted passwords,
            secure HTTPS connections, and CSRF token protection. However, no method of transmission over the internet is
            100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">5. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. These cookies are necessary for the
            platform to function properly and cannot be disabled.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-charcoal mb-3">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@fashionswap.com.np" className="text-terracotta hover:text-terracotta-dark font-medium">
              support@fashionswap.com.np
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
