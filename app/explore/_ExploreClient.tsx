"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExploreSwiper } from "@/components/explore/ExploreSwiper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Bookmark, Globe, Heart, MapPin, XCircle } from "lucide-react";
import type { City } from "@prisma/client";
import { getCityImageUrl } from "@/lib/utils";

interface UserTaste {
  id: string;
  type: "LIKE" | "DISLIKE" | "SAVE";
  city: City;
}

interface ExploreCity extends City {
  activities?: Array<{
    id: string;
    name: string;
    estimatedCost: number;
    category: string;
    imageUrl?: string | null;
  }>;
}

interface Props {
  initialCities: ExploreCity[];
}

export function ExploreClient({ initialCities }: Props) {
  const [tastes, setTastes] = useState<UserTaste[]>([]);
  const [loadingTastes, setLoadingTastes] = useState(false);

  const fetchTastes = async () => {
    setLoadingTastes(true);
    try {
      const res = await fetch("/api/user/taste");
      const data: UserTaste[] = await res.json();
      setTastes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTastes(false);
    }
  };

  return (
    <Tabs 
      defaultValue="swipe" 
      className="flex flex-col h-full"
      onValueChange={(value) => {
        if (value === "taste") {
          void fetchTastes();
        }
      }}
    >
      <div className="flex justify-center mb-4">
        <TabsList className="bg-via-white border-2 border-via-black p-1 shadow-brutalist-sm">
          <TabsTrigger value="swipe" className="h-10 w-12 justify-center px-0" aria-label="Explore destinations">
            <Globe size={18} />
          </TabsTrigger>
          <TabsTrigger 
            value="taste" 
            className="h-10 w-12 justify-center px-0"
            aria-label="My taste"
          >
            <Heart size={18} />
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
            <div className="border border-dashed border-via-black bg-via-white px-4 py-12 text-center">
              <MapPin size={28} className="mx-auto mb-3 text-via-grey-mid" />
              <p className="font-mono text-xs uppercase text-via-grey-mid">No swiped places yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tastes.map((t) => (
                <div 
                  key={t.id} 
                  className="bg-via-white border-2 border-via-black p-3 flex gap-4 shadow-brutalist-sm"
                >
                  <div className="w-20 h-20 shrink-0 border border-via-black overflow-hidden relative">
                    <Image 
                      src={t.city.imageUrl || getCityImageUrl(t.city.name, t.city.country)}
                      alt={t.city.name}
                      fill
                      className="object-cover" 
                    />
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
