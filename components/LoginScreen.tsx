"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import { Building2, KeyRound, Mail } from "lucide-react";

export default function LoginScreen() {
  const { login, setView } = usePortal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not create reset token.");
      }
      setInfo(data.token ? `Reset token created: ${data.token}` : "Reset token created.");
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : "Could not request password reset.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Bento Box Card Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-bento flex flex-col items-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-4 shadow-md shadow-emerald-500/20">
            <Building2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
            Welcome to VendorBridge
          </h2>
          <p className="text-slate-400 text-sm mt-1 text-center mb-8">
            Access your secure procurement workspace
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-medium text-center">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-medium text-center">
                {info}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
              {isSubmitting ? "Signing In..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
            <span className="text-xs text-slate-400 font-medium">
              Don&apos;t have an account?{" "}
            </span>
            <button
              onClick={() => setView("register")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
