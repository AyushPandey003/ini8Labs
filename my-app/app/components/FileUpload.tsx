"use client";

import { useState, useRef } from "react";

interface Props {
    onUpload: (file: File) => Promise<void>;
}

export default function FileUpload({ onUpload }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    };

    const processFile = async (file: File) => {
        if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed");
            return;
        }

        setIsUploading(true);
        try {
            await onUpload(file);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div
            className={`relative w-full p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out ${isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className={`p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2 ${isUploading ? 'animate-pulse' : ''}`}>
                    {isUploading ? (
                        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isUploading ? "Uploading..." : "Upload Medical Record"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Drag & drop your PDF here, or{" "}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none"
                            disabled={isUploading}
                        >
                            browse
                        </button>
                    </p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        PDF files only, up to 10MB
                    </p>
                </div>
            </div>
        </div>
    );
}
