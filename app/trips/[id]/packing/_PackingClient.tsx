"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckSquare, Square, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { PackingItemData, PackingCategory } from "@/types";

const CATEGORIES: PackingCategory[] = ["CLOTHING", "DOCUMENTS", "ELECTRONICS", "TOILETRIES", "MISC"];
const CAT_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c.charAt(0) + c.slice(1).toLowerCase() }));

const TEMPLATES: Record<string, Array<{ name: string; category: PackingCategory }>> = {
  Beach: [
    { name: "Swimsuit", category: "CLOTHING" }, { name: "Sunscreen", category: "TOILETRIES" },
    { name: "Sunglasses", category: "CLOTHING" }, { name: "Beach towel", category: "MISC" },
    { name: "Flip flops", category: "CLOTHING" }, { name: "Snorkel gear", category: "MISC" },
  ],
  Backpacking: [
    { name: "Passport", category: "DOCUMENTS" }, { name: "Travel insurance", category: "DOCUMENTS" },
    { name: "Power bank", category: "ELECTRONICS" }, { name: "Universal adapter", category: "ELECTRONICS" },
    { name: "First aid kit", category: "MISC" }, { name: "Rain jacket", category: "CLOTHING" },
  ],
  Business: [
    { name: "Business cards", category: "DOCUMENTS" }, { name: "Laptop", category: "ELECTRONICS" },
    { name: "Charger", category: "ELECTRONICS" }, { name: "Formal shirts (×3)", category: "CLOTHING" },
    { name: "Dress shoes", category: "CLOTHING" },
  ],
};

const schema = z.object({
  name: z.string().min(1, "Item name required"),
  category: z.enum(["CLOTHING", "DOCUMENTS", "ELECTRONICS", "TOILETRIES", "MISC"]),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: string;
  initialItems: PackingItemData[];
}

export function PackingClient({ tripId, initialItems }: Props) {
  const [items, setItems] = useState<PackingItemData[]>(initialItems);
  const [filter, setFilter] = useState<PackingCategory | "ALL">("ALL");
  const [loading, setLoading] = useState<string | null>(null);
  const [addingTemplate, setAddingTemplate] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "MISC" },
  });
  const watchCat = watch("category");

  const filtered = filter === "ALL" ? items : items.filter((i) => i.category === filter);
  const packed = items.filter((i) => i.isPacked).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;

  async function onAdd(values: FormValues) {
    const res = await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) return;
    const item = await res.json();
    setItems((p) => [...p, { ...item, createdAt: new Date(item.createdAt).toISOString() }]);
    reset({ category: "MISC" });
  }

  async function toggle(item: PackingItemData) {
    setLoading(item.id);
    const res = await fetch(`/api/packing/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPacked: !item.isPacked }),
    });
    if (res.ok) {
      setItems((p) => p.map((i) => i.id === item.id ? { ...i, isPacked: !i.isPacked } : i));
    }
    setLoading(null);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/packing/${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((i) => i.id !== id));
  }

  async function resetAll() {
    const packed = items.filter((i) => i.isPacked);
    await Promise.all(
      packed.map((item) =>
        fetch(`/api/packing/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPacked: false }),
        })
      )
    );
    setItems((p) => p.map((i) => ({ ...i, isPacked: false })));
  }

  async function applyTemplate(tpl: string) {
    setAddingTemplate(true);
    const data = TEMPLATES[tpl];
    const res = await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await res.json();
      const newItems = data.map((d, i) => ({
        id: `temp-${Date.now()}-${i}`,
        tripId,
        name: d.name,
        category: d.category,
        isPacked: false,
        createdAt: new Date().toISOString(),
      }));
      setItems((p) => [...p, ...newItems]);
      // Reload to get real IDs
      const all = await fetch(`/api/trips/${tripId}/packing`);
      if (all.ok) {
        const fresh = await all.json();
        setItems(fresh.map((i: PackingItemData & { createdAt: string | Date }) => ({
          ...i, createdAt: new Date(i.createdAt).toISOString(),
        })));
      }
    }
    setAddingTemplate(false);
  }

  return (
    <div className="space-y-6 max-w-2xl mt-6">
      {/* Progress */}
      <div className="bg-via-white border border-via-black p-4" style={{ boxShadow: "3px 3px 0px #111111" }}>
        <div className="flex justify-between items-center mb-2">
          <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid">Packing Progress</p>
          <p className="font-mono text-xs text-via-black font-bold">{packed}/{items.length} packed</p>
        </div>
        <div className="h-2 bg-via-grey-light">
          <div className="h-full bg-via-navy transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && items.length > 0 && (
          <p className="font-mono text-xs text-via-navy mt-2 font-medium">All packed. Safe travels!</p>
        )}
      </div>

      {/* Templates */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-2">Quick Templates</p>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(TEMPLATES).map((tpl) => (
            <button
              key={tpl}
              onClick={() => applyTemplate(tpl)}
              disabled={addingTemplate}
              className="font-mono text-xs border border-via-black px-3 py-1.5 hover:bg-via-black hover:text-via-white transition-colors disabled:opacity-50"
            >
              + {tpl}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleSubmit(onAdd)}
        className="border border-via-black p-4 bg-via-white"
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-3">Add Item</p>
        <div className="flex gap-2">
          <input
            {...register("name")}
            placeholder="Item name"
            className="flex-1 border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black"
          />
          <Select
            options={CAT_OPTIONS}
            value={watchCat}
            onValueChange={(v) => setValue("category", v as PackingCategory)}
            className="w-36"
          />
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            <Plus size={14} />
          </Button>
        </div>
        {errors.name && <p className="font-mono text-[11px] text-via-red mt-1">{errors.name.message}</p>}
      </form>

      {/* Filter + Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", ...CATEGORIES] as Array<"ALL" | PackingCategory>).map((cat) => {
          const count = cat === "ALL" ? items.length : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 border transition-colors flex items-center gap-1.5 ${filter === cat ? "bg-via-black text-via-white border-via-black" : "border-via-grey-light text-via-grey-mid hover:border-via-black hover:text-via-black"}`}
            >
              {cat}
              {count > 0 && (
                <span className={`text-[9px] px-1 py-0 leading-4 ${filter === cat ? "bg-via-white/20 text-via-white" : "bg-via-grey-light text-via-grey-dark"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {items.some((i) => i.isPacked) && (
          <button
            onClick={resetAll}
            className="ml-auto font-mono text-[11px] uppercase tracking-wide px-2.5 py-1 border border-via-grey-light text-via-grey-mid hover:border-via-black hover:text-via-black transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-via-grey-light">
          <Package size={32} className="mx-auto text-via-grey-light mb-2" />
          <p className="font-mono text-xs text-via-grey-mid">No items yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-via-white border border-via-grey-light px-3 py-2.5 group"
            >
              <button
                onClick={() => toggle(item)}
                disabled={loading === item.id}
                className="text-via-black hover:text-via-navy transition-colors shrink-0"
              >
                {item.isPacked ? <CheckSquare size={18} strokeWidth={1.5} /> : <Square size={18} strokeWidth={1.5} />}
              </button>
              <span className={`flex-1 font-mono text-sm ${item.isPacked ? "line-through text-via-grey-mid" : "text-via-black"}`}>
                {item.name}
              </span>
              <span className="font-mono text-[10px] uppercase text-via-grey-mid">
                {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
              </span>
              <button
                onClick={() => remove(item.id)}
                className="text-via-red/40 hover:text-via-red transition-colors shrink-0 px-2"
                aria-label="Delete item"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
