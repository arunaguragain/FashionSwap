"use client";

import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  description,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {description && <div className="mt-2 text-sm text-gray-600">{description}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full bg-rose-100 border border-gray-500 bg-white px-3 py-1 text-sm">{cancelLabel}</button>
          <button
            onClick={async () => { await onConfirm(); }}
            disabled={loading}
            className="rounded-full bg-rose-100 border border-rose-200 text-rose-800 hover:bg-rose-200 px-3 py-1 text-sm font-semibold shadow-sm disabled:opacity-60 transition"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
