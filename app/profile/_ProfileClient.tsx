"use client";

import { useState } from "react";
import { User, Mail, Calendar, Globe } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  tripCount: number;
}

export function ProfileClient({ profile, tripCount }: Props) {
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!name.trim() || name === profile.name) return;
    setSaving(true);
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Avatar + stats */}
      <div
        className="bg-via-white border border-via-black p-6 flex items-center gap-5"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <Avatar name={profile.name} src={profile.avatarUrl ?? undefined} size="lg" />
        <div>
          <p className="font-grotesk font-bold text-xl text-via-black">{profile.name}</p>
          <p className="font-mono text-xs text-via-grey-mid">{profile.email}</p>
          <p className="font-mono text-xs text-via-grey-mid mt-2">{tripCount} trip{tripCount !== 1 ? "s" : ""} planned</p>
        </div>
      </div>

      {/* Edit form */}
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

        <div className="flex items-center gap-4 text-via-grey-mid font-mono text-xs pt-1">
          <span className="flex items-center gap-1"><Calendar size={11} strokeWidth={1.5} /> Joined {formatDate(profile.createdAt)}</span>
          <span className="flex items-center gap-1"><Globe size={11} strokeWidth={1.5} /> {profile.language.toUpperCase()}</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={save}
          loading={saving}
          disabled={!name.trim() || name === profile.name}
        >
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
