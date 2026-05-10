"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  X, 
  Mail, 
  Loader2,
  ShieldCheck,
  Shield,
  Trash2
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface Collaborator {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }
}

export function CollaboratorsList({ tripId }: { tripId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [tripId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "EDITOR" }),
      });

      if (res.ok) {
        setEmail("");
        fetchCollaborators();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add person");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-via-black" />
          <h3 className="font-space-grotesk font-bold uppercase tracking-tight text-sm">Trip Collaborators</h3>
        </div>
        <span className="font-mono text-[10px] text-via-grey-mid uppercase tracking-widest">{collaborators.length} Members</span>
      </div>

      <form onSubmit={handleAdd} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-via-grey-mid" size={14} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Invite by email..."
              className="w-full bg-via-white border-2 border-via-black pl-10 pr-3 py-2 font-mono text-xs outline-none focus:bg-via-off-white"
              required
            />
          </div>
          <Button type="submit" disabled={adding} className="h-9 px-4 text-xs font-mono uppercase shrink-0">
            {adding ? <Loader2 size={14} className="animate-spin" /> : "Invite"}
          </Button>
        </div>
        {error && <p className="mt-2 text-[10px] font-mono text-via-red uppercase tracking-widest">{error}</p>}
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-via-grey-mid" /></div>
        ) : (
          collaborators.map((collab) => (
            <div 
              key={collab.id} 
              className="flex items-center gap-3 p-2 border-2 border-via-black bg-via-white shadow-brutalist-sm group transition-transform hover:-translate-y-0.5"
            >
              <Avatar src={collab.user.avatarUrl} name={collab.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-bold text-xs truncate">{collab.user.name}</p>
                <p className="font-mono text-[10px] text-via-grey-mid truncate">{collab.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {collab.role === "OWNER" ? (
                  <div className="p-1.5 bg-via-navy text-via-white">
                    <ShieldCheck size={12} />
                  </div>
                ) : (
                  <div className="p-1.5 bg-via-off-white text-via-grey-mid border border-via-grey-light">
                    <Shield size={12} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
