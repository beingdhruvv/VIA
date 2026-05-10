"use client";

import { useState } from "react";
import { FileText, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import type { NoteData } from "@/types";

interface Props {
  tripId: string;
  initialNotes: NoteData[];
}

export function NotesClient({ tripId, initialNotes }: Props) {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${tripId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    if (res.ok) {
      const n = await res.json();
      setNotes((p) => [{ ...n, createdAt: new Date(n.createdAt).toISOString(), updatedAt: new Date(n.updatedAt).toISOString() }, ...p]);
      setText("");
    }
    setSaving(false);
  }

  async function deleteNote(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((p) => p.filter((n) => n.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-6 max-w-2xl mt-6">
      {/* Compose */}
      <div className="bg-via-white border border-via-black p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-3">New Note</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write anything — ideas, reminders, observations..."
          rows={4}
          className="w-full border border-via-grey-light px-3 py-2 text-sm font-mono text-via-black outline-none focus:border-via-black resize-none bg-via-off-white placeholder:text-via-grey-mid"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="font-mono text-[11px] text-via-grey-light">{text.length} chars</span>
          <Button variant="primary" size="sm" onClick={addNote} loading={saving} disabled={!text.trim()}>
            Save Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-via-grey-light">
          <FileText size={32} className="mx-auto text-via-grey-light mb-2" />
          <p className="font-mono text-xs text-via-grey-mid">No notes yet. Capture your thoughts above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-via-white border border-via-grey-light p-4 group"
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-via-grey-mid">{timeAgo(note.createdAt)}</span>
                  {note.stop?.city && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-via-grey-mid">
                      <MapPin size={10} />
                      {note.stop.city.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  disabled={deletingId === note.id}
                  className="text-via-grey-light hover:text-via-red transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
              <p className="font-mono text-sm text-via-black whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
