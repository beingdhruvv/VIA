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
  Maximize2,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { MemoryData } from "@/types";

interface Props {
  initialMemories: MemoryData[];
  trips: { id: string; name: string }[];
}

const MAX_STORAGE = 200 * 1024 * 1024; // 200MB

export function MemoriesClient({ initialMemories, trips }: Props) {
  const [memories, setMemories] = useState<MemoryData[]>(initialMemories);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [uploading, setUploading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [fullImage, setFullImage] = useState<MemoryData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStorage = memories.reduce((acc, m) => acc + m.fileSize, 0);
  const storagePercent = Math.min((currentStorage / MAX_STORAGE) * 100, 100);

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const filtered = selectedTrip === "all" 
      ? memories 
      : memories.filter(m => m.tripId === selectedTrip);

    const groups: Record<string, MemoryData[]> = {};
    filtered.forEach(m => {
      const date = formatDate(m.takenAt || m.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [memories, selectedTrip]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Controls & Stats */}
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
                {(currentStorage / (1024 * 1024)).toFixed(1)}MB / 200MB
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
                      onClick={() => setFullImage(m)}
                      className="aspect-square relative group cursor-pointer border-2 border-transparent hover:border-via-black transition-all overflow-hidden bg-via-off-white"
                    >
                      <Image 
                        src={m.imageUrl} 
                        alt={m.caption || m.fileName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-via-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        {m.trip && (
                          <span className="bg-via-white border border-via-black px-1.5 py-0.5 font-mono text-[8px] uppercase truncate">
                            {m.trip.name}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Map View Placeholder */}
      {view === "map" && (
        <Card className="h-[600px] flex items-center justify-center border-dashed border-via-grey-light">
          <div className="text-center space-y-4">
            <MapIcon size={40} className="mx-auto text-via-grey-light" />
            <p className="font-mono text-xs uppercase text-via-grey-mid">Interactive Memories Map coming soon.</p>
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
              className="absolute top-6 right-6 text-via-white hover:rotate-90 transition-transform"
              onClick={() => setFullImage(null)}
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
                  src={fullImage.imageUrl} 
                  alt={fullImage.fileName}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Meta bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-via-white border-2 border-via-black p-4 flex justify-between items-center shadow-brutalist"
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
              <div className="flex gap-2">
                <button className="p-2 hover:bg-via-off-white border border-via-black">
                  <Maximize2 size={16} />
                </button>
                <button className="p-2 hover:bg-via-red hover:text-via-white border border-via-black text-via-red">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
