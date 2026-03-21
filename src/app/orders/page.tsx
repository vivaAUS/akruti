"use client";

import { useState } from "react";
import { Search, Package, Printer, CheckCircle, Truck, Star } from "lucide-react";
import Link from "next/link";

const statusSteps = [
  { id: "received",   icon: Package,      label: "Order Received",    body: "Your order has been confirmed and payment processed." },
  { id: "printing",   icon: Printer,      label: "Printing",           body: "Your item is currently being printed on our precision printers." },
  { id: "quality",    icon: CheckCircle,  label: "Quality Check",      body: "Final inspection — checking dimensions, surface finish, and structural integrity." },
  { id: "shipped",    icon: Truck,        label: "Dispatched",         body: "Your order has been handed to the courier and is on its way." },
  { id: "delivered",  icon: Star,         label: "Delivered",          body: "Enjoy your print! We'd love to see it — tag us on Instagram." },
];

// Mock order for demo purposes
const MOCK_ORDER = {
  id: "AKR-2026-0042",
  email: "demo@example.com",
  date: "18 March 2026",
  items: [
    { name: "Geometric Fidget Cube", qty: 1, price: "$15.00" },
    { name: "Cable Clip Organiser",  qty: 2, price: "$18.00" },
  ],
  total: "$33.00",
  status: "printing" as const,
  eta: "22–24 March 2026",
};

export default function OrdersPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail]     = useState("");
  const [order, setOrder]     = useState<typeof MOCK_ORDER | null>(null);
  const [error, setError]     = useState("");

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Demo: match mock order
    if (
      orderId.trim().toUpperCase() === MOCK_ORDER.id &&
      email.trim().toLowerCase() === MOCK_ORDER.email
    ) {
      setOrder(MOCK_ORDER);
    } else {
      setOrder(null);
      setError("No order found with those details. Please check your confirmation email.");
    }
  }

  const activeStep = order ? statusSteps.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          POST-PURCHASE
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          Track Order
        </h1>
        <p className="text-sm text-akruti-muted font-body mt-4 max-w-md leading-relaxed">
          Enter your order ID and email address to see the live status of your print.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-8 pt-16">
        {/* Lookup form */}
        <form onSubmit={handleLookup} className="flex flex-col gap-4 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                Order ID
              </label>
              <input
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="AKR-2026-XXXX"
                className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                style={{ border: "1px solid rgba(210,197,179,0.5)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                style={{ border: "1px solid rgba(210,197,179,0.5)" }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-akruti-dark text-akruti-cream font-headline text-sm uppercase tracking-widest py-3.5 hover:bg-akruti-primary transition-colors duration-300"
          >
            <Search className="w-4 h-4" />
            Look Up Order
          </button>
          {error && (
            <p className="text-sm font-body text-red-600 text-center">{error}</p>
          )}
        </form>

        {/* Demo hint */}
        {!order && !error && (
          <p className="text-[0.65rem] text-akruti-muted/60 font-body text-center mb-12">
            Demo: use ID <span className="font-bold">AKR-2026-0042</span> and email <span className="font-bold">demo@example.com</span>
          </p>
        )}

        {/* Order result */}
        {order && (
          <div className="flex flex-col gap-10">
            {/* Order summary */}
            <div className="p-6" style={{ border: "1px solid rgba(210,197,179,0.4)" }}>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">Order</p>
                  <p className="font-headline text-xl text-akruti-dark">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">Placed</p>
                  <p className="font-headline text-base text-akruti-dark">{order.date}</p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(210,197,179,0.3)" }} className="pt-4 flex flex-col gap-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm font-body text-akruti-dark">
                    <span>{item.name} × {item.qty}</span>
                    <span className="text-akruti-muted">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between" style={{ borderTop: "1px solid rgba(210,197,179,0.3)", paddingTop: "0.75rem" }}>
                <span className="text-sm font-body text-akruti-muted uppercase tracking-wider">Total</span>
                <span className="font-headline text-lg text-akruti-dark">{order.total}</span>
              </div>
            </div>

            {/* Status timeline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-xl uppercase tracking-tight text-akruti-dark">
                  Status
                </h2>
                <span className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">
                  Est. delivery: {order.eta}
                </span>
              </div>
              <div className="flex flex-col gap-0">
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const done    = i < activeStep;
                  const current = i === activeStep;
                  const upcoming = i > activeStep;
                  return (
                    <div key={step.id} className="flex gap-5 items-start">
                      {/* Icon column */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          done    ? "bg-akruti-dark"  :
                          current ? "bg-akruti-gold"  :
                                    "bg-akruti-surface"
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            done || current ? "text-white" : "text-akruti-border"
                          }`} />
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`w-px flex-1 my-1 min-h-[2.5rem] ${
                            done ? "bg-akruti-dark" : "bg-akruti-border/40"
                          }`} />
                        )}
                      </div>
                      {/* Text */}
                      <div className="pb-6">
                        <p className={`font-headline text-sm uppercase tracking-tight mb-0.5 ${
                          upcoming ? "text-akruti-muted/50" : "text-akruti-dark"
                        }`}>
                          {step.label}
                          {current && (
                            <span className="ml-2 text-[0.6rem] tracking-[0.15em] uppercase text-akruti-gold font-body">
                              ← current
                            </span>
                          )}
                        </p>
                        {!upcoming && (
                          <p className="text-xs font-body text-akruti-muted leading-relaxed">{step.body}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help link */}
            <div className="text-center py-4" style={{ borderTop: "1px solid rgba(210,197,179,0.2)" }}>
              <p className="text-sm font-body text-akruti-muted">
                Questions about your order?{" "}
                <Link href="/contact" className="text-akruti-primary border-b border-akruti-primary pb-px hover:text-akruti-gold hover:border-akruti-gold transition-colors">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
