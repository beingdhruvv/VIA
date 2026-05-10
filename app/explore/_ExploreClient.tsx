"use client";

import React, { useState } from "react";
import { ExploreSwiper } from "@/components/explore/ExploreSwiper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Heart, Globe, Bookmark, XCircle } from "lucide-react";
import type { City } from "@prisma/client";

interface Props {
  initialCities: City[];
}

export function ExploreClient({ initialCities }: Props) {
  const [tastes, setTastes] = useState<any[]>([]);
  const [loadingTastes, setLoadingTastes] = useState(false);

  const fetchTastes = async () => {
    setLoadingTastes(true);
    try {
      const res = await fetch("/api/user/taste");
      const data = await res.json();
      setTastes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTastes(false);
    }
  };

  return (
    <Tabs defaultValue="swipe" className="flex flex-col h-full">
      <div className="flex justify-center mb-4">
        <TabsList className="bg-via-white border-2 border-via-black p-1 shadow-brutalist-sm">
          <TabsTrigger value="swipe" className="font-mono text-xs uppercase gap-2">
            <Globe size={14} /> Explore
          </TabsTrigger>
          <TabsTrigger 
            value="taste" 
            className="font-mono text-xs uppercase gap-2"
            onClick={fetchTastes}
          >
            <Heart size={14} /> My Taste
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="swipe" className="flex-1 min-h-0">
        <ExploreSwiper initialCities={initialCities} />
      </TabsContent>

      <TabsContent value="taste" className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-20">
          {loadingTastes ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-via-black"></div>
            </div>
          ) : tastes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-via-grey-light">
              <p className="font-mono text-xs uppercase text-via-grey-mid">No swiped places yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tastes.map((t) => (
                <div 
                  key={t.id} 
                  className="bg-via-white border-2 border-via-black p-3 flex gap-4 shadow-brutalist-sm"
                >
                  <div className="w-20 h-20 shrink-0 border border-via-black overflow-hidden">
                    <img src={t.city.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${t.city.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{t.city.name}</h4>
                      <div className={
                        t.type === "LIKE" ? "text-green-500" : 
                        t.type === "SAVE" ? "text-via-navy" : "text-red-500"
                      }>
                        {t.type === "LIKE" && <Heart size={14} fill="currentColor" />}
                        {t.type === "SAVE" && <Bookmark size={14} fill="currentColor" />}
                        {t.type === "DISLIKE" && <XCircle size={14} />}
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-via-grey-mid uppercase">{t.city.country}</p>
                    <p className="text-[10px] text-via-grey-dark mt-2 line-clamp-2">{t.city.region}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
