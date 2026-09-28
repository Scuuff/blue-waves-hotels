// components/Footer.jsx
import { useState } from "react";
import { apiPost } from "../services/apiClient";
import logoWhite from "../assets/Images/white_logo.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [feedback, setFeedback] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setFeedback("");

    try {
      const result = await apiPost("/newsletter/subscribe", { email });
      setStatus("success");
      setFeedback(result?.message || "You're subscribed!");
      setEmail("");
      setTimeout(() => {
        setStatus("idle");
        setFeedback("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setFeedback(error?.message || "Something went wrong. Please try again.");
      setTimeout(() => {
        setStatus("idle");
        setFeedback("");
      }, 5000);
    }
  };

  /* Theme-aware tokens: light mode is a clean premium white; dark mode keeps
     the original deep-navy styling. Shared strings keep every element in the
     footer consistent with the active theme. */
  const tone = {
    heading:
      "text-gold-600 dark:text-[#9fc0ec] font-semibold mb-4 uppercase text-sm tracking-wider",
    muted: "text-slate-500 dark:text-white/55",
    link: "text-slate-500 hover:text-gold-600 dark:text-white/55 dark:hover:text-[#9fc0ec] transition-colors text-sm",
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Blog", href: "#" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Safety Info", href: "#" },
      { name: "Cancellation", href: "#" },
      { name: "Contact Us", href: "/help" }
    ],
    legal: [
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Cookie Policy", href: "#" }
    ]
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      href: "#"
    },
    {
      name: "Instagram",
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      href: "#"
    },
    {
      name: "LinkedIn",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      href: "#"
    }
  ];

  return (
    <footer className="border-t border-[#e6eef7] bg-white pt-16 pb-8 text-[#1d3252] dark:border-transparent dark:bg-[#0a1420] dark:text-white/85">
      <div className="w-full px-8 lg:px-16 xl:px-24">

        {/* Top Section: Newsletter */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#e6eef7] bg-[#f0f5fa] p-8 md:flex-row md:p-12 dark:border-transparent dark:bg-[#0f1f33]">
          <div className="text-center md:text-left">
            <h3 className="mb-2 font-serif text-2xl font-semibold text-[#1d3252] dark:text-white">
              Stay in the loop
            </h3>
            <p className={tone.muted}>
              Get travel deals and updates delivered to your inbox
            </p>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSubscribe} className="flex w-full gap-2 md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#dfe8f2] bg-white px-4 py-3 text-[#1d3252] placeholder-[#8fa3bd] outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 md:w-64 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:focus:border-[#9fc0ec] dark:focus:ring-0"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="whitespace-nowrap rounded-lg bg-[#1d3252] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#28415f] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#2f6fb3] dark:hover:bg-[#26567E]"
              >
                {status === "loading" ? "Sending..." : "Subscribe"}
              </button>
            </form>
            {feedback && (
              <p
                className={`mt-2 text-sm ${
                  status === "error"
                    ? "text-red-500 dark:text-red-400"
                    : "text-emerald-600 dark:text-[#96D0F2]"
                }`}
                role="status"
              >
                {feedback}
              </p>
            )}
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <img
                src={logoWhite}
                alt="Blue Waves Hotel"
                className="h-12 w-auto object-contain brightness-0 opacity-80 dark:brightness-100 dark:opacity-100"
              />
            </div>
            <p className={`${tone.muted} mb-4 text-sm leading-relaxed`}>
              Luxury stays across Egypt's finest destinations — from the
              Mediterranean shores of Alexandria to the Red Sea coast.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3252]/5 transition-colors hover:bg-[#1d3252] dark:bg-white/10 dark:hover:bg-[#2f6fb3]"
                  aria-label={social.name}
                >
                  <svg
                    className="h-5 w-5 fill-current text-[#1d3252]/70 transition-colors group-hover:text-white dark:text-white/85 dark:group-hover:text-white"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className={tone.heading}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={tone.link}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className={tone.heading}>Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={tone.link}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className={tone.heading}>Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={tone.link}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e6eef7] pt-8 dark:border-white/10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className={`${tone.muted} text-sm`}>
              © {new Date().getFullYear()} Blue Waves Hotel. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <span className={`${tone.muted} flex items-center gap-2 text-sm`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 dark:bg-[#96D0F2]"></span>
                All systems operational
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
