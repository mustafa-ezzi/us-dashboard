"use client";

import { useStore } from "@/lib/store";
import { Heart, Plus, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import Image from "next/image";
import type { MemoryTag } from "@/lib/types";

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

export function AddMemoryButton() {
    const { addMemory } = useStore();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [selectedTags, setSelectedTags] = useState<MemoryTag[]>([]);
    const [memoryDate, setMemoryDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const toggleTag = (tag: MemoryTag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleClose = () => {
        setOpen(false);
        setText("");
        setSelectedTags([]);
        setMemoryDate(new Date().toISOString().split("T")[0]);
        removeImage();
    };

    const handleSubmit = async () => {
        if (!text.trim()) return;

        await addMemory({
            text: text.trim(),
            memoryDateISO: memoryDate,
            tags: selectedTags.length > 0 ? selectedTags : ["Other"],
            imageFile: imageFile ?? undefined,
        });

        handleClose();
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full card p-4 flex items-center justify-between hover:shadow-md transition group cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose group-hover:bg-rose-200 transition">
                        <Heart size={16} />
                    </span>
                    <p className="font-semibold text-ink group-hover:text-rose transition">
                        Add a memory
                    </p>
                </div>
                <Plus size={20} className="text-rose" />
            </button>

            <Modal
                open={open}
                onClose={handleClose}
                title="Save this moment ✨"
            >
                {/* Date picker */}
                <div>
                    <label className="label">When did this happen?</label>
                    <input
                        type="date"
                        value={memoryDate}
                        onChange={(e) => setMemoryDate(e.target.value)}
                        className="input mt-1.5 w-full"
                    />
                </div>

                {/* Text content */}
                <div className="mt-4">
                    <label className="label">What happened?</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Tell us about this moment..."
                        className="input mt-1.5 min-h-[100px] resize-none w-full"
                        maxLength={1000}
                    />
                    <p className="mt-1 text-[11px] text-ink-muted">
                        {text.length}/1000
                    </p>
                </div>

                {/* Image upload */}
                <div className="mt-4">
                    <label className="label">Add a photo (optional)</label>
                    {imagePreview ? (
                        <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100">
                            <div className="relative h-40 w-full">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 w-full border-2 border-dashed border-line rounded-lg p-6 text-center hover:border-rose hover:bg-rose-50 transition cursor-pointer"
                        >
                            <Upload size={20} className="mx-auto text-ink-muted mb-2" />
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

                {/* Tags */}
                <div className="mt-4">
                    <label className="label">Tags</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {AVAILABLE_TAGS.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`rounded-full px-3 py-1.5 text-sm transition ${selectedTags.includes(tag)
                                        ? "bg-rose-500 text-white font-semibold"
                                        : "border border-line bg-white text-ink-soft hover:border-rose hover:text-rose"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                    <button className="btn-ghost flex-1" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary flex-1"
                        disabled={!text.trim()}
                        onClick={handleSubmit}
                    >
                        Save Memory
                    </button>
                </div>
            </Modal>
        </>
    );
}
