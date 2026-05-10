"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { User, Mail, Calendar, Globe, Lock, LogOut, Trash2, Check, Camera, Image as ImageIcon, ShieldAlert, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { APP_PUBLIC_VERSION } from "@/lib/app-version";
import type { UserProfile } from "@/types";

const AVATAR_OPTIONS = [
  { id: '1', seed: 'Felix' },
  { id: '2', seed: 'Aneka' },
  { id: '3', seed: 'Bastian' },
  { id: '4', seed: 'Casper' },
  { id: '5', seed: 'Dante' },
  { id: '6', seed: 'Elsa' },
  { id: '7', seed: 'Finn' },
  { id: '8', seed: 'Gaya' },
];

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

interface Props {
  profile: UserProfile;
  tripCount: number;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "bn", label: "Bengali" },
];

export function ProfileClient({ profile, tripCount }: Props) {
  const [name, setName] = useState(profile.name);
  const [language, setLanguage] = useState(profile.language ?? "en");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [homeCity, setHomeCity] = useState(profile.homeCity ?? "");
  const [homeCountry, setHomeCountry] = useState(profile.homeCountry ?? "");
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function saveProfile() {
    setSaving(true);
    setProfileError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          language, 
          avatarUrl,
          homeCity: homeCity.trim() || null,
          homeCountry: homeCountry.trim() || null
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileError(data.error ?? "Failed to save.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPwdError(null);
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPwdError(data.error ?? "Failed to change password.");
        return;
      }
      setPwdSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } finally {
      setChangingPwd(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete account.");
    }
  }

  const profileChanged = 
    name.trim() !== profile.name || 
    language !== (profile.language ?? "en") ||
    avatarUrl !== profile.avatarUrl ||
    homeCity.trim() !== (profile.homeCity ?? "") ||
    homeCountry.trim() !== (profile.homeCountry ?? "");

  return (
    <div className="mt-6 space-y-6 max-w-2xl">
      <div
        className="bg-via-white border border-via-black p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
          <Avatar name={profile.name} src={avatarUrl ?? undefined} size="lg" className="border-2 border-via-black" />
          <div className="absolute inset-0 bg-via-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera size={20} className="text-via-white" />
          </div>
          <input 
            type="file" 
            id="avatar-input" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setTempAvatar(url);
                setShowEditor(true);
              }
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-grotesk font-bold text-xl text-via-black">{profile.name}</p>
          <p className="font-mono text-xs text-via-grey-mid">{profile.email}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 font-mono text-xs text-via-grey-mid">
            <span className="flex items-center gap-1"><Calendar size={11} strokeWidth={1.5} /> Joined {formatDate(profile.createdAt)}</span>
            <span>{tripCount} trip{tripCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      {/* Avatar Picker */}
      <div
        className="bg-via-white border border-via-black p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid flex items-center gap-1.5">
          <ImageIcon size={11} strokeWidth={1.5} /> Choose Avatar
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {AVATAR_OPTIONS.map((opt) => {
            const url = getDicebearUrl(opt.seed);
            const isSelected = avatarUrl === url;
            return (
              <button
                key={opt.id}
                onClick={() => setAvatarUrl(url)}
                className={`relative aspect-square border-2 transition-all p-1 hover:scale-105 ${isSelected ? 'border-via-black bg-via-off-white' : 'border-via-grey-light opacity-60 hover:opacity-100'}`}
              >
                <img src={url} alt={`Avatar ${opt.id}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 bg-via-black text-via-white rounded-full p-0.5 border border-via-white">
                    <Check size={8} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Account details */}
      <div
        className="bg-via-white border border-via-black p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid">Account Details</p>

        <div className="space-y-1">
          <label className="font-mono text-xs text-via-grey-mid flex items-center gap-1.5">
            <User size={11} strokeWidth={1.5} /> Display Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black"
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs text-via-grey-mid flex items-center gap-1.5">
            <Mail size={11} strokeWidth={1.5} /> Email
          </label>
          <input
            value={profile.email}
            readOnly
            className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono text-via-grey-mid bg-via-off-white cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs text-via-grey-mid flex items-center gap-1.5">
            <Globe size={11} strokeWidth={1.5} /> Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black bg-via-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {profileError && (
          <p className="text-xs text-via-red font-mono border border-via-red px-3 py-2">{profileError}</p>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={saveProfile}
          loading={saving}
          disabled={!name.trim() || !profileChanged}
        >
          {saved ? <><Check size={13} /> Saved</> : "Save Changes"}
        </Button>
      </div>

      {/* Location Preferences */}
      <div
        className="bg-via-white border border-via-black p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid flex items-center gap-1.5">
          <MapPin size={11} strokeWidth={1.5} /> Home Location
        </p>
        <p className="font-inter text-[11px] text-via-grey-mid leading-relaxed">
          Set your home location to receive localized travel recommendations and accurate distance estimates.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-via-grey-mid uppercase">City</label>
            <input
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-via-grey-mid uppercase">Country</label>
            <input
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              placeholder="e.g. India"
              className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={saveProfile}
          loading={saving}
          disabled={!profileChanged}
        >
          Update Location
        </Button>
      </div>

      {/* Change password */}
      <div
        className="bg-via-white border border-via-black p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid flex items-center gap-1.5">
          <Lock size={11} strokeWidth={1.5} /> Change Password
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-via-grey-mid">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black bg-via-off-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[11px] text-via-grey-mid">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars"
                className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black bg-via-off-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[11px] text-via-grey-mid">Confirm New</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black bg-via-off-white"
              />
            </div>
          </div>
        </div>

        {pwdError && <p className="text-xs text-via-red font-mono border border-via-red px-3 py-2">{pwdError}</p>}
        {pwdSuccess && <p className="text-xs text-via-navy font-mono border border-via-navy px-3 py-2">Password changed successfully.</p>}

        <Button
          variant="secondary"
          size="sm"
          onClick={changePassword}
          loading={changingPwd}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          Update Password
        </Button>
      </div>

      {/* Sign out */}
      <div
        className="bg-via-white border border-via-black p-5"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-3 flex items-center gap-1.5">
          <LogOut size={11} strokeWidth={1.5} /> Session
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
            Sign Out
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDelete(true)}
            className="text-via-red hover:bg-via-red hover:text-via-white"
          >
            <Trash2 size={13} className="mr-1.5" /> Delete Account
          </Button>
        </div>
      </div>

      {/* Critical Actions */}
      <div
        className="bg-via-white border border-via-red p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #C1121F" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-red flex items-center gap-1.5">
          <ShieldAlert size={11} strokeWidth={1.5} /> Critical Actions
        </p>

        {!showDelete ? (
          <div>
            <p className="font-mono text-xs text-via-grey-mid mb-3">
              Permanently delete your account and all trip data. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDelete(true)}
              className="font-mono text-xs border border-via-red text-via-red px-4 py-2 hover:bg-via-red hover:text-via-white transition-colors"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-via-red">
              Type <strong>DELETE</strong> to confirm permanent account deletion.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE"'
              className="w-full border border-via-red px-3 py-2 text-sm font-mono outline-none focus:border-via-red bg-via-off-white"
            />
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="font-mono text-xs border border-via-red bg-via-red text-via-white px-4 py-2 disabled:opacity-50 hover:bg-via-black hover:border-via-black transition-colors"
              >
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                className="font-mono text-xs border border-via-grey-light px-4 py-2 hover:border-via-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-via-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-via-white border-2 border-via-black p-6 shadow-brutalist overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b-2 border-via-black pb-4">
              <h3 className="font-grotesk font-bold text-xl uppercase italic">Photo Editor</h3>
              <button onClick={() => setShowEditor(false)} className="hover:bg-via-off-white p-1 border border-via-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative aspect-square w-full overflow-hidden border-2 border-via-black bg-via-off-white flex items-center justify-center">
               <div 
                 className="relative w-full h-full"
                 style={{
                   transform: `scale(${zoom})`,
                   transition: 'transform 0.1s ease-out'
                 }}
               >
                 <img src={tempAvatar!} alt="Crop preview" className="w-full h-full object-contain" />
               </div>
               {/* Crop guide overlay */}
               <div className="absolute inset-0 pointer-events-none border-[40px] border-via-black/40 rounded-full box-content -m-[40px]"></div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase text-via-grey-mid">Zoom</span>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-via-black"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => setShowEditor(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => {
                    setAvatarUrl(tempAvatar);
                    setShowEditor(false);
                    setZoom(1);
                  }}
                >
                  Set Profile Picture
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-via-grey-mid uppercase tracking-widest pt-2">
        Build <span className="text-via-black">{APP_PUBLIC_VERSION}</span>
      </p>
    </div>
  );
}
