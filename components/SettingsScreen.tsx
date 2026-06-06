"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  User,
  Sun,
  Moon,
  Save,
  Image as ImageIcon,
  Sparkles,
  Camera,
  ToggleLeft,
  ToggleRight,
  Check,
} from "lucide-react";

export default function SettingsScreen() {
  const { userProfile, updateProfile, theme, setTheme } = usePortal();

  // Edit Profile Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [phone, setPhone] = useState(userProfile.phone);
  const [address, setAddress] = useState(userProfile.address);
  const [avatarSeed, setAvatarSeed] = useState("david");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Avatar presets
  const presets = ["david", "procure", "officer", "lisa", "alex", "bridge"];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      role,
      phone,
      address,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSelectPreset = (seed: string) => {
    setAvatarSeed(seed);
    updateProfile({
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
    });
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarUrl.trim()) {
      updateProfile({
        avatarUrl: customAvatarUrl.trim(),
      });
    }
  };

  const handleToggleGrayscale = () => {
    updateProfile({
      avatarGrayscale: !userProfile.avatarGrayscale,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Settings & Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your profile, preferences, and look-and-feel of the workspace
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile info (2/3 col on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-slate-800 tracking-tight">
                Profile Information
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {isSaved && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Profile saved successfully!
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Role
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="e.g. Procurement Officer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Office Address"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile image, Avatar & Grayscale selector */}
        <div className="space-y-6">
          
          {/* Avatar Settings Bento Card */}
          <div className="bento-card p-6 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Camera className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                  Avatar Configuration
                </h3>
              </div>

              {/* Current Avatar Frame */}
              <div className="flex flex-col items-center gap-3 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
                <div className="relative">
                  {/* Avatar wrapper */}
                  <div className="w-20 h-20 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-1 shadow-sm">
                    {/* Img with Grayscale B&W filter toggle */}
                    <img
                      src={userProfile.avatarUrl}
                      alt="User Avatar"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        userProfile.avatarGrayscale ? "avatar-bw" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    Profile Filter:
                  </span>
                  <button
                    onClick={handleToggleGrayscale}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {userProfile.avatarGrayscale ? (
                      <span className="flex items-center gap-1">
                        <ToggleRight className="w-5 h-5 text-emerald-500 fill-emerald-100" /> Black & White
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ToggleLeft className="w-5 h-5 text-slate-350" /> Colors Enabled
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2 mb-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Bot Preset Avatar
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((seed) => {
                    const isSelected = avatarSeed === seed;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => handleSelectPreset(seed)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center bg-slate-50/50 p-1 hover:border-emerald-300 transition-colors ${
                          isSelected ? "border-emerald-500 bg-emerald-50/10" : "border-slate-100"
                        }`}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`}
                          alt={seed}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paste Image URL */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Custom Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomAvatar}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 text-slate-650 font-bold rounded-lg text-[10px] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Theme customizer Bento Card */}
          <div className="bento-card p-6 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                  Interface Theme
                </h3>
              </div>

              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Choose site-wide style theme
              </span>

              {/* Toggle controls */}
              <div className="grid grid-cols-2 gap-3">
                {/* White Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("white")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-xl font-bold text-xs transition-all duration-200 ${
                    theme === "white"
                      ? "bg-emerald-50/20 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sun className="w-4.5 h-4.5" />
                  White Theme
                </button>

                {/* Black Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("black")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-xl font-bold text-xs transition-all duration-200 ${
                    theme === "black"
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Moon className="w-4.5 h-4.5" />
                  Black Theme
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
