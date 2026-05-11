"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { User, Mail, Calendar, Globe, Lock, LogOut, Trash2, Check, Camera, Image as ImageIcon, X, MapPin } from "lucide-react";
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
  const { update } = useSession();
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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
          // avatarUrl is now handled separately by the dedicated API
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
      await update({ name: name.trim() });
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    setSaving(true);
    setProfileError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileError(data.error ?? "Failed to upload avatar.");
        return;
      }
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      setTempAvatar(null);
      await update({ image: data.avatarUrl });
    } catch (err) {
      console.error(err);
      setProfileError("An error occurred during upload.");
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
        <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
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
                setPendingFile(file);
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
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-via-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-via-white border-2 border-via-black p-6 shadow-brutalist flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-via-black pb-4">
              <h3 className="font-grotesk font-bold text-xl uppercase italic">Customize Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="hover:bg-via-off-white p-1 border border-via-black">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Avatar name={profile.name} src={avatarUrl ?? undefined} size="xl" className="border-2 border-via-black" />
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  <Camera size={14} className="mr-2" /> Upload Photo
                </Button>
                {avatarUrl && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-via-red border-via-red hover:bg-via-red hover:text-via-white"
                    onClick={() => {
                      setAvatarUrl(null);
                      update({ image: null });
                    }}
                  >
                    <Trash2 size={14} className="mr-2" /> Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-via-grey-mid flex items-center gap-1.5">
                <ImageIcon size={11} strokeWidth={1.5} /> Preset Avatars
              </p>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((opt) => {
                  const url = getDicebearUrl(opt.seed);
                  const isSelected = avatarUrl === url;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setAvatarUrl(url);
                        update({ image: url });
                      }}
                      className={`relative aspect-square border-2 transition-all p-1 hover:scale-105 ${isSelected ? 'border-via-black bg-via-off-white' : 'border-via-grey-light opacity-60 hover:opacity-100'}`}
                    >
                      <div className="relative w-full h-full">
                        <Image src={url} alt={`Avatar ${opt.id}`} fill className="object-cover" />
                      </div>
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

            <Button variant="primary" className="w-full" onClick={() => setShowAvatarModal(false)}>
              Done
            </Button>
          </div>
        </div>
      )}

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
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-via-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-via-white border-2 border-via-black p-6 shadow-brutalist">
            <h3 className="font-grotesk font-bold text-xl uppercase italic mb-4">Delete Account</h3>
            <p className="font-inter text-sm text-via-grey-dark mb-4">
              This action is permanent. All your trips, memories, and data will be erased.
              Type <span className="font-mono font-bold text-via-black">DELETE</span> to confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="w-full border-2 border-via-black px-3 py-2 font-mono text-sm mb-4 outline-none focus:bg-via-off-white"
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                loading={deleting}
                disabled={deleteConfirm !== "DELETE"}
                onClick={deleteAccount}
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}


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
                                   <Image src={tempAvatar!} alt="Crop preview" fill className="object-contain" />
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
                  loading={saving}
                  onClick={() => {
                    if (pendingFile) {
                      uploadAvatar(pendingFile).then(() => {
                        setShowEditor(false);
                        setZoom(1);
                        setPendingFile(null);
                      });
                    } else {
                      setShowEditor(false);
                    }
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
