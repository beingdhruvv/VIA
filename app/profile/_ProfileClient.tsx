"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { User, Mail, Calendar, Globe, Lock, LogOut, Trash2, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

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
        body: JSON.stringify({ name: name.trim(), language }),
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

  const profileChanged = name.trim() !== profile.name || language !== (profile.language ?? "en");

  return (
    <div className="mt-6 space-y-6 max-w-2xl">
      {/* Avatar + stats */}
      <div
        className="bg-via-white border border-via-black p-6 flex items-center gap-5"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <Avatar name={profile.name} src={profile.avatarUrl ?? undefined} size="lg" />
        <div>
          <p className="font-grotesk font-bold text-xl text-via-black">{profile.name}</p>
          <p className="font-mono text-xs text-via-grey-mid">{profile.email}</p>
          <div className="flex items-center gap-3 mt-2 font-mono text-xs text-via-grey-mid">
            <span className="flex items-center gap-1"><Calendar size={11} strokeWidth={1.5} /> Joined {formatDate(profile.createdAt)}</span>
            <span>{tripCount} trip{tripCount !== 1 ? "s" : ""}</span>
          </div>
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
        <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
          Sign Out
        </Button>
      </div>

      {/* Danger zone */}
      <div
        className="bg-via-white border border-via-red p-5 space-y-4"
        style={{ boxShadow: "3px 3px 0px #C1121F" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-red flex items-center gap-1.5">
          <Trash2 size={11} strokeWidth={1.5} /> Danger Zone
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
    </div>
  );
}
