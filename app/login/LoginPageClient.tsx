"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { Footer } from "@/components/footer/Footer";

export function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Visual only — no backend authentication logic
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-3 py-12 sm:px-4 sm:py-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <SiteLogo className="mb-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Welcome back
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Access your orders, track shipments, and manage preferences.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs ring-1 ring-black/[0.04] sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none transition-colors focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none transition-colors focus:border-[var(--brand)]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--brand)] accent-[var(--brand)]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[var(--muted-foreground)] cursor-default">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <span>Sign In</span>
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-center text-xs text-[var(--muted-foreground)]">
              <span>Don&apos;t have an account? </span>
              <Link
                href="/signup"
                className="font-bold text-[var(--brand)] hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
