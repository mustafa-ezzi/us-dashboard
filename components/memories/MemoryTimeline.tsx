"use client";

import { useStore } from "@/lib/store";
import { Heart, Pencil, Trash2, Upload, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Memory, MemoryTag } from "@/lib/types";

const AVAILABLE_TAGS: MemoryTag[] = [
  "First Times",
  "Fights We Survived",
  "Laughed Hard",
  "Dates",
  "Special Moments",
  "Milestones",
  "Adventures",
  "Inside Jokes",
  "Other",
];

export function MemoryTimeline() {
  const { state, removeMemory, updateMemory } = useStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Memory | null>(null);

  const memories = [...state.memories].sort(
    (a, b) =>
      new Date(b.memoryDateISO).getTime() - new Date(a.memoryDateISO).getTime()
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
            <p className="text-sm text-ink-soft">
              Start adding your favorite moments!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="card overflow-hidden transition hover:shadow-lg"
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {format(new Date(memory.memoryDateISO), "MMM d, yyyy")}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Added{" "}
                  {formatDistanceToNow(new Date(memory.createdISO), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(memory)}
                  className="rounded p-2 text-ink-muted transition hover:bg-rose-50 hover:text-rose"
                  aria-label="Edit memory"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(memory.id)}
                  className="rounded p-2 text-ink-muted transition hover:bg-rose-50 hover:text-rose"
                  aria-label="Delete memory"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {memory.imageUrl && (
              <div className="relative mt-3 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={memory.imageUrl}
                  alt="Memory"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </div>
            )}

            <p className="mt-3 text-sm leading-relaxed text-ink">{memory.text}</p>

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

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete memory?"
      >
        <p className="text-sm text-ink-soft">
          This memory will be permanently deleted. You can&apos;t undo this.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => setDeleteId(null)}
          >
            Keep it
          </button>
          <button
            type="button"
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

      {editing && (
        <EditMemoryModal
          memory={editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            await updateMemory(input);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditMemoryModal({
  memory,
  onClose,
  onSave,
}: {
  memory: Memory;
  onClose: () => void;
  onSave: (input: {
    id: string;
    text: string;
    memoryDateISO: string;
    tags: string[];
    imageFile?: File;
    removeImage?: boolean;
  }) => Promise<void>;
}) {
  const [text, setText] = useState(memory.text);
  const [selectedTags, setSelectedTags] = useState<MemoryTag[]>(
    memory.tags as MemoryTag[]
  );
  const [memoryDate, setMemoryDate] = useState(memory.memoryDateISO);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(memory.imageUrl ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(memory.text);
    setSelectedTags(memory.tags as MemoryTag[]);
    setMemoryDate(memory.memoryDateISO);
    setImageFile(null);
    setImagePreview(memory.imageUrl ?? "");
    setRemoveImage(false);
  }, [memory]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview((event.target?.result as string) ?? "");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTag = (tag: MemoryTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        id: memory.id,
        text: text.trim(),
        memoryDateISO: memoryDate,
        tags: selectedTags.length > 0 ? selectedTags : ["Other"],
        imageFile: imageFile ?? undefined,
        removeImage: removeImage && !imageFile,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit memory">
      <div>
        <label className="label">When did this happen?</label>
        <input
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.target.value)}
          className="input mt-1.5 w-full"
        />
      </div>

      <div className="mt-4">
        <label className="label">What happened?</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us about this moment..."
          className="input mt-1.5 min-h-[100px] w-full resize-none"
          maxLength={1000}
        />
        <p className="mt-1 text-[11px] text-ink-muted">{text.length}/1000</p>
      </div>

      <div className="mt-4">
        <label className="label">Photo</label>
        {imagePreview ? (
          <div className="relative mt-2 overflow-hidden rounded-lg bg-gray-100">
            <div className="relative h-40 w-full">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={imagePreview.startsWith("data:")}
              />
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-ink shadow hover:bg-white"
                aria-label="Replace photo"
              >
                <Upload size={14} />
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-line p-6 text-center transition hover:border-rose hover:bg-rose-50"
          >
            <Upload size={20} className="mx-auto mb-2 text-ink-muted" />
            <p className="text-sm font-medium text-ink">Click to upload</p>
            <p className="text-xs text-ink-muted">PNG, JPG up to 5MB</p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      <div className="mt-4">
        <label className="label">Tags</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                selectedTags.includes(tag)
                  ? "bg-rose-500 font-semibold text-white"
                  : "border border-line bg-white text-ink-soft hover:border-rose hover:text-rose"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={!text.trim() || saving}
          onClick={handleSubmit}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}
