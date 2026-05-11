"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { 
  Upload, 
  Map as MapIcon, 
  Grid, 
  Calendar, 
  X, 
  Trash2,
  Download,
  Share2,
  Users,
  Maximize2,
  HardDrive,
  CheckSquare,
  Image as ImageIcon,
  MapPin,
  Navigation,
  Square,
  Link as LinkIcon,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { protectedUploadUrl } from "@/lib/upload-paths";
import { motion, AnimatePresence } from "framer-motion";
import type { MemoryData } from "@/types";

interface Props {
  initialMemories: MemoryData[];
  trips: { id: string; name: string }[];
  storageLimit?: number;
}

const DEFAULT_STORAGE_LIMIT = 200 * 1024 * 1024; // 200MB

function imageSrc(path: string) {
  return protectedUploadUrl(path);
}

function isPrivateImage(path: string) {
  return imageSrc(path).startsWith("/api/uploads/");
}

function pinPosition(latitude: number, longitude: number) {
  const left = ((longitude + 180) / 360) * 100;
  const top = ((90 - latitude) / 180) * 100;

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(88, Math.max(12, top))}%`,
  };
}

export function MemoriesClient({ initialMemories, trips, storageLimit = DEFAULT_STORAGE_LIMIT }: Props) {
  const [memories, setMemories] = useState<MemoryData[]>(initialMemories);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [uploading, setUploading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [fullImage, setFullImage] = useState<MemoryData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [shareEmails, setShareEmails] = useState("");
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<"link" | "photo">("link");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ownedMemories = memories.filter((memory) => memory.userId !== "" && memory.canDelete !== false);
  const currentStorage = ownedMemories.reduce((acc, m) => acc + m.fileSize, 0);
  const storagePercent = Math.min((currentStorage / storageLimit) * 100, 100);

  const filteredMemories = useMemo(() => {
    return selectedTrip === "all"
      ? memories 
      : memories.filter(m => m.tripId === selectedTrip);
  }, [memories, selectedTrip]);

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: Record<string, MemoryData[]> = {};
    filteredMemories.forEach(m => {
      const date = formatDate(m.takenAt || m.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredMemories]);

  const mapMemories = useMemo(() => {
    return filteredMemories.filter((memory) => memory.latitude !== null && memory.longitude !== null);
  }, [filteredMemories]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadNotice(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}...`);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedTrip !== "all") {
        formData.append("tripId", selectedTrip);
      }

      try {
        const res = await fetch("/api/memories", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const newMemoryData = await res.json();
          setMemories(prev => [newMemoryData, ...prev]);
          uploaded++;
        } else {
          const data = await res.json().catch(() => ({}));
          setUploadNotice(data.error ?? "One upload failed.");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        setUploadNotice("Upload failed. Please try again.");
      }
    }
    setUploading(false);
    if (uploaded > 0) setUploadNotice(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} memories? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setIsSelectMode(false);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownloadSelected = () => {
    const selected = memories.filter((memory) => selectedIds.has(memory.id));
    selected.forEach((memory, index) => {
      window.setTimeout(() => {
        const link = document.createElement("a");
        link.href = imageSrc(memory.imageUrl);
        link.download = memory.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, index * 150);
    });
  };

  const handleShareSelected = async () => {
    if (selectedIds.size === 0 || !shareEmails.trim()) return;
    setShareStatus("Sharing...");
    try {
      const res = await fetch("/api/memories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), emails: shareEmails }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShareStatus(data.error ?? "Share failed.");
        return;
      }
      const users = Array.isArray(data.users) ? data.users : [];
      setMemories((prev) => prev.map((memory) => selectedIds.has(memory.id)
        ? { ...memory, sharedWith: users }
        : memory
      ));
      setShareStatus(`Shared with ${users.map((user: { email: string }) => user.email).join(", ")}.`);
      setShareEmails("");
    } catch (err) {
      console.error("Share failed:", err);
      setShareStatus("Share failed. Please try again.");
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setFullImage(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleShareMemory = async (memory: MemoryData) => {
    const url = `${window.location.origin}${imageSrc(memory.imageUrl)}`;
    if (shareMode === "photo" && navigator.share) {
      try {
        const response = await fetch(imageSrc(memory.imageUrl));
        const blob = await response.blob();
        const file = new File([blob], memory.fileName, { type: blob.type || "image/jpeg" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: memory.caption || memory.fileName, files: [file] });
          return;
        }
      } catch {
        setShareStatus("Photo share unavailable. Link copied instead.");
      }
    }
    if (navigator.share && shareMode === "link") {
      await navigator.share({
        title: memory.caption || memory.fileName,
        url,
      }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setShareStatus("Image link copied.");
  };

  return (
    <div className="space-y-6 pb-20">
      <section className="border border-via-black bg-via-white shadow-brutalist">
        <div className="grid divide-y divide-via-black md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="bg-via-black p-4 text-via-white">
            <p className="font-mono text-[10px] uppercase tracking-widest text-via-white/70">Memory vault</p>
            <p className="mt-2 font-grotesk text-2xl font-black uppercase italic">{filteredMemories.length} moments</p>
          </div>
          <div className="p-4">
            <p className="font-mono text-[10px] uppercase text-via-grey-mid">Shared with you</p>
            <p className="mt-2 font-mono text-2xl font-bold">{memories.filter((memory) => memory.sharedBy).length}</p>
          </div>
          <div className="p-4">
            <p className="font-mono text-[10px] uppercase text-via-grey-mid">Mapped photos</p>
            <p className="mt-2 font-mono text-2xl font-bold">{mapMemories.length}</p>
          </div>
        </div>
      </section>
      {/* Controls & Stats */}
      <div className="sticky top-0 z-20 -mx-2 border-y border-via-black bg-via-off-white px-2 py-3 md:top-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <div className="flex bg-via-white border-2 border-via-black p-1 shadow-brutalist-sm">
              <button 
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 flex items-center gap-2 font-mono text-xs uppercase transition-colors ${view === "grid" ? 'bg-via-black text-via-white' : 'hover:bg-via-off-white'}`}
              >
                <Grid size={14} /> Grid
              </button>
              <button 
                onClick={() => setView("map")}
                className={`px-3 py-1.5 flex items-center gap-2 font-mono text-xs uppercase transition-colors ${view === "map" ? 'bg-via-black text-via-white' : 'hover:bg-via-off-white'}`}
              >
                <MapIcon size={14} /> Map
              </button>
            </div>

            <button 
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`border-2 border-via-black px-3 py-1.5 flex items-center gap-2 font-mono text-xs uppercase transition-all shadow-brutalist-sm ${isSelectMode ? 'bg-via-black text-via-white translate-x-[1px] translate-y-[1px] shadow-none' : 'bg-via-white text-via-black hover:bg-via-off-white'}`}
            >
              {isSelectMode ? <CheckSquare size={14} /> : <Square size={14} />} 
              {isSelectMode ? "Cancel Select" : "Select"}
            </button>

            <select 
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              className="bg-via-white border-2 border-via-black px-3 py-2 font-mono text-xs uppercase outline-none focus:bg-via-off-white shadow-brutalist-sm"
            >
              <option value="all">All Trips</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="max-w-xs space-y-1.5">
            <div className="flex justify-between items-end">
              <p className="font-mono text-[10px] uppercase text-via-grey-mid flex items-center gap-1.5">
                <HardDrive size={11} /> Storage
              </p>
              <p className="font-mono text-[10px] text-via-black">
                {(currentStorage / (1024 * 1024)).toFixed(1)}MB / {(storageLimit / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>
            <div className="h-2 bg-via-grey-light border border-via-black overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                className={`h-full border-r border-via-black ${storagePercent > 90 ? 'bg-via-red' : 'bg-via-black'}`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <Button 
            variant="primary" 
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            className="shadow-brutalist-sm"
          >
            <Upload size={18} /> Upload Memories
          </Button>
        </div>
      </div>
      </div>

      {uploadNotice && (
        <div className="border border-via-black bg-via-white px-3 py-2 font-mono text-[10px] uppercase text-via-grey-dark shadow-brutalist-sm">
          {uploadNotice}
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="space-y-12">
          {groupedMemories.length === 0 ? (
            <Card className="py-20 text-center border-dashed border-via-grey-light">
              <p className="font-mono text-xs uppercase text-via-grey-mid">No memories found. Start uploading your travel moments.</p>
            </Card>
          ) : (
            groupedMemories.map(([date, items]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-grotesk font-bold text-lg uppercase italic flex items-center gap-2">
                    <Calendar size={18} /> {date}
                  </h3>
                  <div className="h-[2px] flex-1 bg-via-black/10" />
                  <span className="font-mono text-[10px] text-via-grey-mid uppercase">{items.length} items</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
                  {items.map((m) => (
                    <motion.div 
                      key={m.id}
                      layoutId={m.id}
                      onClick={() => isSelectMode ? toggleSelect(m.id) : setFullImage(m)}
                      className={`aspect-square relative group cursor-pointer border-2 transition-all overflow-hidden bg-via-off-white ${selectedIds.has(m.id) ? 'border-via-black ring-4 ring-via-black/20' : 'border-transparent hover:border-via-black'}`}
                    >
                      <Image 
                        src={imageSrc(m.imageUrl)}
                        alt={m.caption || m.fileName}
                        fill
                        unoptimized={isPrivateImage(m.imageUrl)}
                        className={`object-cover transition-transform duration-500 ${selectedIds.has(m.id) ? 'scale-90' : 'group-hover:scale-105'}`}
                      />
                      
                      {isSelectMode && (
                        <div className="absolute top-2 left-2 z-10">
                          {selectedIds.has(m.id) ? (
                            <div className="bg-via-black text-via-white p-0.5 border border-via-white">
                              <CheckSquare size={14} />
                            </div>
                          ) : (
                            <div className="bg-via-white/80 p-0.5 border border-via-black">
                              <Square size={14} />
                            </div>
                          )}
                        </div>
                      )}

                      {!isSelectMode && (
                        <div className="absolute inset-0 bg-via-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          {m.trip && (
                            <span className="bg-via-white border border-via-black px-1.5 py-0.5 font-mono text-[8px] uppercase truncate">
                              {m.trip.name}
                            </span>
                          )}
                        </div>
                      )}

                      {m.sharedWith && m.sharedWith.length > 0 && (
                        <div className="absolute right-2 top-2 z-10 border border-via-black bg-via-white px-1.5 py-0.5 font-mono text-[8px] uppercase shadow-brutalist-sm">
                          <Users size={10} className="mr-1 inline" />
                          {m.sharedWith.length}
                        </div>
                      )}
                      {m.sharedBy && (
                        <div className="absolute left-2 top-2 z-10 border border-via-black bg-via-white px-1.5 py-0.5 font-mono text-[8px] uppercase shadow-brutalist-sm">
                          Shared
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Map View */}
      {view === "map" && (
        <Card className="overflow-hidden border-via-black">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="relative min-h-[420px] border-b border-via-black bg-via-off-white lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute left-1/2 top-0 h-full w-px bg-via-grey-light" />
                <div className="absolute left-1/4 top-0 h-full w-px bg-via-grey-light" />
                <div className="absolute left-3/4 top-0 h-full w-px bg-via-grey-light" />
                <div className="absolute left-0 top-1/2 h-px w-full bg-via-grey-light" />
                <div className="absolute left-0 top-1/4 h-px w-full bg-via-grey-light" />
                <div className="absolute left-0 top-3/4 h-px w-full bg-via-grey-light" />
              </div>
              <div className="absolute left-4 top-4 border border-via-black bg-via-white px-3 py-2 shadow-brutalist-sm">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase text-via-black">
                  <Navigation size={12} /> Memory Atlas
                </p>
              </div>

              {mapMemories.length > 0 ? (
                mapMemories.map((memory, index) => (
                  <button
                    key={memory.id}
                    type="button"
                    onClick={() => setFullImage(memory)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 border border-via-black bg-via-white p-1 shadow-brutalist-sm transition-transform hover:z-10 hover:-translate-y-[calc(50%+2px)]"
                    style={pinPosition(memory.latitude ?? 0, memory.longitude ?? 0)}
                    aria-label={`Open ${memory.caption || memory.fileName}`}
                  >
                    <div className="relative h-12 w-12 overflow-hidden border border-via-black bg-via-off-white">
                      <Image src={imageSrc(memory.imageUrl)} alt={memory.caption || memory.fileName} fill unoptimized={isPrivateImage(memory.imageUrl)} className="object-cover" />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border border-via-black bg-via-white px-2 py-0.5 font-mono text-[9px] uppercase group-hover:block">
                      {memory.locationName || memory.trip?.name || `Pin ${index + 1}`}
                    </span>
                  </button>
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div className="max-w-sm border border-dashed border-via-black bg-via-white p-6">
                    <MapPin size={34} className="mx-auto mb-3 text-via-grey-mid" />
                    <p className="font-mono text-xs uppercase text-via-grey-mid">
                      Uploaded memories do not include location metadata yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-via-white p-4">
              <div className="mb-4 flex items-center justify-between border-b border-via-black pb-2">
                <h3 className="font-grotesk text-sm font-bold uppercase">Places</h3>
                <span className="font-mono text-[10px] uppercase text-via-grey-mid">{filteredMemories.length} items</span>
              </div>
              <div className="space-y-3">
                {filteredMemories.slice(0, 8).map((memory) => (
                  <button
                    key={memory.id}
                    type="button"
                    onClick={() => setFullImage(memory)}
                    className="flex w-full items-center gap-3 border border-via-grey-light bg-via-off-white p-2 text-left transition-colors hover:border-via-black hover:bg-via-white"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-via-black bg-via-white">
                      <Image src={imageSrc(memory.imageUrl)} alt={memory.caption || memory.fileName} fill unoptimized={isPrivateImage(memory.imageUrl)} className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[10px] uppercase text-via-black">
                        {memory.locationName || memory.trip?.name || "Unpinned memory"}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-via-grey-mid">
                        {formatDate(memory.takenAt || memory.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
                {filteredMemories.length === 0 && (
                  <div className="border border-dashed border-via-grey-light p-4 text-center">
                    <ImageIcon size={24} className="mx-auto mb-2 text-via-grey-mid" />
                    <p className="font-mono text-[10px] uppercase text-via-grey-mid">No memories in this filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Full Image Modal */}
      <AnimatePresence>
        {fullImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-via-black/95 flex flex-col items-center justify-center p-4 md:p-10"
            onClick={() => setFullImage(null)}
          >
            <button 
              type="button"
              className="absolute top-6 right-6 text-via-white hover:rotate-90 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                setFullImage(null);
              }}
              aria-label="Close memory preview"
            >
              <X size={32} />
            </button>

            <motion.div 
              layoutId={fullImage.id}
              className="relative w-full max-w-5xl h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image 
                  src={imageSrc(fullImage.imageUrl)}
                  alt={fullImage.fileName}
                  fill
                  unoptimized={isPrivateImage(fullImage.imageUrl)}
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Meta bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-1/2 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-col gap-4 border-2 border-via-black bg-via-white p-4 shadow-brutalist md:flex-row md:items-center md:justify-between"
              onClick={e => e.stopPropagation()}
            >
              <div className="min-w-0">
                <p className="font-grotesk font-bold text-sm uppercase italic">{fullImage.caption || fullImage.fileName}</p>
                <div className="flex gap-3 mt-1 font-mono text-[10px] text-via-grey-mid uppercase">
                  <span>{formatDate(fullImage.takenAt || fullImage.createdAt)}</span>
                  {fullImage.trip && (
                    <span className="flex items-center gap-1 border-l pl-3 border-via-grey-light">
                      <MapIcon size={10} /> {fullImage.trip.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex border border-via-black bg-via-off-white p-1">
                  <button
                    type="button"
                    onClick={() => setShareMode("link")}
                    className={`flex items-center gap-1 px-2 py-1 font-mono text-[9px] uppercase ${shareMode === "link" ? "bg-via-black text-via-white" : "text-via-black"}`}
                  >
                    <LinkIcon size={12} /> Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareMode("photo")}
                    className={`flex items-center gap-1 px-2 py-1 font-mono text-[9px] uppercase ${shareMode === "photo" ? "bg-via-black text-via-white" : "text-via-black"}`}
                  >
                    <Copy size={12} /> Photo
                  </button>
                </div>
                <a
                  href={imageSrc(fullImage.imageUrl)}
                  download={fullImage.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-via-off-white border border-via-black"
                  aria-label="Download memory image"
                >
                  <Download size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => void handleShareMemory(fullImage)}
                  className="p-2 hover:bg-via-off-white border border-via-black"
                  aria-label="Share memory image"
                >
                  <Share2 size={16} />
                </button>
                <a
                  href={imageSrc(fullImage.imageUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-via-off-white border border-via-black"
                  aria-label="Open memory image"
                >
                  <Maximize2 size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => void handleDeleteMemory(fullImage.id)}
                  disabled={fullImage.canDelete === false}
                  className="p-2 hover:bg-via-red hover:text-via-white border border-via-black text-via-red disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Delete memory"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {isSelectMode && selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-via-white border-2 border-via-black p-4 flex items-center gap-6 shadow-brutalist min-w-[300px]"
          >
            <div className="font-mono text-xs uppercase font-bold">
              {selectedIds.size} items selected
            </div>
            <div className="h-6 w-[1px] bg-via-grey-light" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <input
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                placeholder="email@example.com"
                className="min-w-0 border border-via-black bg-via-off-white px-2 py-1 font-mono text-[10px] outline-none focus:bg-via-white"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!shareEmails.trim()}
                onClick={handleShareSelected}
                className="font-mono text-[10px]"
              >
                <Share2 size={14} className="mr-2" /> Share
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadSelected}
                className="font-mono text-[10px]"
              >
                <Download size={14} className="mr-2" /> Download
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedIds(new Set())}
                className="font-mono text-[10px]"
              >
                Clear
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleDeleteSelected}
                disabled={memories.filter((memory) => selectedIds.has(memory.id)).some((memory) => memory.canDelete === false)}
                className="bg-via-red border-via-red hover:bg-via-black hover:border-via-black font-mono text-[10px]"
              >
                <Trash2 size={14} className="mr-2" /> Delete
              </Button>
            </div>
            {shareStatus && (
              <p className="absolute -top-8 left-0 border border-via-black bg-via-white px-2 py-1 font-mono text-[9px] uppercase text-via-grey-dark">
                {shareStatus}
              </p>
            )}
            <button 
              type="button"
              onClick={() => setIsSelectMode(false)}
              className="ml-auto p-1 hover:bg-via-off-white"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
