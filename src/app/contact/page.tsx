"use client";

import { useState } from "react";
import { Mail, Instagram, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const topics = [
  { id: "order",   label: "Order enquiry" },
  { id: "custom",  label: "Custom print quote" },
  { id: "return",  label: "Return / refund" },
  { id: "other",   label: "Something else" },
];

export default function ContactPage() {
  const [topic, setTopic] = useState("order");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Message sent! We'll reply within 24 hours.");
    setSubmitted(true);
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          GET IN TOUCH
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          Contact
        </h1>
        <p className="text-sm text-akruti-muted font-body mt-4 max-w-md leading-relaxed">
          Questions, custom quotes, or anything else — we read every message and reply within 24 hours.
        </p>
      </div>

      <div className="max-w-[1920px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* Left — contact info */}
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="font-headline text-xl uppercase tracking-tight text-akruti-dark mb-6">
              Contact Details
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-akruti-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body mb-0.5">Email</p>
                  <a href="mailto:hello@akruti.com.au"
                     className="text-sm font-body text-akruti-dark hover:text-akruti-primary transition-colors border-b border-akruti-border pb-px">
                    hello@akruti.com.au
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-akruti-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body mb-0.5">Instagram</p>
                  <a href="https://instagram.com/akruti3d"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm font-body text-akruti-dark hover:text-akruti-primary transition-colors border-b border-akruti-border pb-px">
                    @akruti3d
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-akruti-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body mb-0.5">Response time</p>
                  <p className="text-sm font-body text-akruti-dark">Within 24 hours</p>
                  <p className="text-xs font-body text-akruti-muted">Mon – Fri, 9am – 6pm AEST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="font-headline text-xl uppercase tracking-tight text-akruti-dark mb-4">
              Quick Links
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Track your order",     href: "/orders" },
                { label: "Request a custom print", href: "/custom-prints" },
                { label: "Read the FAQ",           href: "/faq" },
              ].map((link) => (
                <a key={link.label} href={link.href}
                   className="text-sm font-body text-akruti-primary border-b border-akruti-primary/30 pb-px w-fit hover:text-akruti-gold hover:border-akruti-gold transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form (spans 2 cols) */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-24 gap-6">
              <CheckCircle className="w-14 h-14 text-akruti-gold" />
              <h2 className="font-headline text-3xl uppercase tracking-tight text-akruti-dark">
                Message Sent
              </h2>
              <p className="text-sm text-akruti-muted font-body max-w-sm leading-relaxed">
                Thanks for reaching out. We&apos;ll reply to your email within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="font-headline text-sm uppercase tracking-widest text-akruti-primary border-b border-akruti-primary pb-px hover:text-akruti-gold hover:border-akruti-gold transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Topic selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTopic(t.id)}
                      className={`font-headline text-sm uppercase tracking-tight px-4 py-2 transition-all duration-200 ${
                        topic === t.id
                          ? "bg-akruti-dark text-akruti-cream"
                          : "text-akruti-muted hover:text-akruti-dark border border-akruti-border"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
              </div>

              {topic === "order" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="AKR-2026-XXXX"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tell us what you need…"
                  className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40 resize-none"
                  style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-akruti-dark text-akruti-cream font-headline text-sm uppercase tracking-widest py-4 hover:bg-akruti-primary transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
