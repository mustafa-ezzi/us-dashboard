"use client";

import { useStore } from "@/lib/store";
import { Heart, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function MemoryTimeline() {
    const { state, removeMemory } = useStore();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const memories = [...state.memories].sort(
        (a, b) => new Date(b.memoryDateISO).getTime() - new Date(a.memoryDateISO).getTime()
    );

    if (memories.length === 0) {
        return (
            <div className="card p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-100 text-rose">
                        <Heart size={24} />
                    </span>
                    <div>
                        <p className="font-semibold text-ink">Your memory jar is empty</p>
                        <p className="text-sm text-ink-soft">Start adding your favorite moments!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {memories.map((memory) => (
                <div key={memory.id} className="card overflow-hidden hover:shadow-lg transition">
                    <div className="p-4">
                        {/* Header with date and delete */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                                    {format(new Date(memory.memoryDateISO), "MMM d, yyyy")}
                                </p>
                                <p className="text-[11px] text-ink-muted mt-0.5">
                                    Added {formatDistanceToNow(new Date(memory.createdISO), { addSuffix: true })}
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteId(memory.id)}
                                className="flex-shrink-0 rounded p-2 text-ink-muted hover:bg-rose-50 hover:text-rose transition"
                                aria-label="Delete memory"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Image if present */}
                        {memory.imageUrl && (
                            <div className="mt-3 relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={memory.imageUrl}
                                    alt="Memory"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 400px"
                                />
                            </div>
                        )}

                        {/* Text content */}
                        <p className={`mt-3 text-sm leading-relaxed text-ink ${memory.imageUrl ? "" : ""}`}>
                            {memory.text}
                        </p>

                        {/* Tags */}
                        {memory.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {memory.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-block rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Delete confirmation modal */}
            <Modal
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                title="Delete memory?"
            >
                <p className="text-sm text-ink-soft">This memory will be permanently deleted. You can't undo this.</p>
                <div className="mt-4 flex gap-2">
                    <button className="btn-ghost flex-1" onClick={() => setDeleteId(null)}>
                        Keep it
                    </button>
                    <button
                        className="btn-primary flex-1 bg-rose-600 hover:bg-rose-700"
                        onClick={async () => {
                            if (deleteId) {
                                await removeMemory(deleteId);
                                setDeleteId(null);
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
}
