"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { BookOpen } from "lucide-react";

export function MemoryJarCard() {
  const { state } = useStore();
  const memoryCount = state.memories.length;
  const lastMemory = state.memories[0];

  return (
    <Link href="/memories" className="card p-4 hover:shadow-md transition group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose group-hover:bg-rose-200 transition">
            <BookOpen size={16} />
          </span>
          <div>
            <p className="stat-label group-hover:text-rose transition">Memory Jar</p>
            <p className="text-sm text-ink-soft">
              {memoryCount} {memoryCount === 1 ? "memory" : "memories"} saved
            </p>
          </div>
        </div>
      </div>
      {lastMemory && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-ink-soft group-hover:bg-rose-100 transition line-clamp-2">
          "{lastMemory.text}"
        </p>
      )}
    </Link>
  );
}
