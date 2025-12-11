"use client";

import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import DocumentList from "./components/DocumentList";
import Notification from "./components/Notification";
import { Document, Notification as NotificationType } from "./types";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      showNotification("error", "Could not load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotification({ id, type, message });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(JSON.parse(errorText).detail || "Upload failed");
      }

      const newDoc = await res.json();
      setDocuments((prev) => [newDoc, ...prev]);
      showNotification("success", "Document uploaded successfully!");
    } catch (error: any) {
      showNotification("error", error.message || "Failed to upload document");
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showNotification("success", "Document deleted successfully");
    } catch (error) {
      showNotification("error", "Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans selection:bg-blue-500/30">
      {notification && (
        <Notification notification={notification} onClose={handleCloseNotification} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              P
            </div>
            <span className="font-bold text-xl tracking-tight">PatientPortal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-inner"></div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Helper Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white pb-2">
            Manage Your Medical Records
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Securely upload, organize, and access your prescriptions, test results, and health documents in one place.
          </p>
        </section>

        {/* Upload Section */}
        <section className="max-w-2xl mx-auto">
          <FileUpload onUpload={handleUpload} />
        </section>

        {/* Documents Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Recent Documents
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
                {documents.length}
              </span>
            </h2>
            {/* Filter/Sort could go here */}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <DocumentList
              documents={documents}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-600 border-t border-gray-200 dark:border-gray-900 mt-20">
        <p>© 2025 Patient Portal Inc. Secure & Private.</p>
      </footer>
    </div>
  );
}
