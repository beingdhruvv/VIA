"use client";

import { useState } from "react";
import { FileText, Trash2, MapPin, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import type { NoteData } from "@/types";

interface Stop { id: string; cityName: string; }

interface Props {
  tripId: string;
  initialNotes: NoteData[];
  stops?: Stop[];
}

export function NotesClient({ tripId, initialNotes, stops = [] }: Props) {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes);
  const [text, setText] = useState("");
  const [selectedStopId, setSelectedStopId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${tripId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim(), stopId: selectedStopId || null }),
    });
    if (res.ok) {
      const n = await res.json();
      setNotes((p) => [{
        ...n,
        createdAt: new Date(n.createdAt).toISOString(),
        updatedAt: new Date(n.updatedAt).toISOString(),
      }, ...p]);
      setText("");
      setSelectedStopId("");
    }
    setSaving(false);
  }

  async function deleteNote(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((p) => p.filter((n) => n.id !== id));
    setDeletingId(null);
  }

  function startEdit(note: NoteData) {
    setEditingId(note.id);
    setEditText(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return;
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNotes((p) => p.map((n) => n.id === id ? {
        ...n,
        content: updated.content,
        updatedAt: new Date(updated.updatedAt).toISOString(),
      } : n));
    }
    cancelEdit();
  }

  function formatAbsolute(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium", timeStyle: "short",
    });
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
        <div className="flex items-center gap-3 mt-2">
          {stops.length > 0 && (
            <select
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="flex-1 border border-via-grey-light px-3 py-1.5 text-xs font-mono text-via-black bg-via-off-white outline-none focus:border-via-black"
            >
              <option value="">Whole trip</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>{s.cityName}</option>
              ))}
            </select>
          )}
          <span className="font-mono text-[11px] text-via-grey-light ml-auto">{text.length} chars</span>
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
            <li key={note.id} className="bg-via-white border border-via-grey-light p-4 group">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-mono text-[10px] text-via-grey-mid cursor-default"
                    title={formatAbsolute(note.createdAt)}
                  >
                    {timeAgo(note.createdAt)}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-1 text-via-grey-light">(edited)</span>
                    )}
                  </span>
                  {note.stop?.city && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-via-grey-mid">
                      <MapPin size={10} />
                      {note.stop.city.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {editingId !== note.id && (
                    <button
                      onClick={() => startEdit(note)}
                      className="text-via-grey-light hover:text-via-black transition-colors"
                      title="Edit note"
                    >
                      <Pencil size={13} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    disabled={deletingId === note.id}
                    className="text-via-grey-light hover:text-via-red transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full border border-via-black px-3 py-2 text-sm font-mono text-via-black outline-none resize-none bg-via-off-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(note.id)}
                      disabled={!editText.trim()}
                      className="flex items-center gap-1 font-mono text-[11px] border border-via-black bg-via-black text-via-white px-3 py-1.5 hover:bg-via-navy transition-colors disabled:opacity-50"
                    >
                      <Check size={11} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 font-mono text-[11px] border border-via-grey-light px-3 py-1.5 hover:border-via-black transition-colors"
                    >
                      <X size={11} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-sm text-via-black whitespace-pre-wrap leading-relaxed">{note.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
