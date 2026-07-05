"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(1000, "Comment must be 1000 characters or fewer").optional(),
});

type FormData = z.infer<typeof ReviewSchema>;

type Props = {
  initial?: { rating?: number; comment?: string };
  onCancel?: () => void;
  onSubmit: (payload: { rating: number; comment?: string }) => Promise<any> | any;
  submitting?: boolean;
  submitLabel?: string;
};

const ReviewForm: React.FC<Props> = ({ initial, onCancel, onSubmit, submitting, submitLabel = "Save" }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: { rating: initial?.rating ?? 5, comment: initial?.comment ?? "" }
  });

  const currentRating = watch("rating");

  React.useEffect(() => {
    // ensure fields are registered and initial values applied
    register("rating");
    register("comment");
    if (initial) {
      if (initial.rating !== undefined) setValue("rating", initial.rating as number);
      if (initial.comment !== undefined) setValue("comment", initial.comment as string);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium w-20">Rating</label>
        <div role="radiogroup" aria-label="Rating" className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((v) => {
            const filled = (hover ?? (currentRating ?? 0)) >= v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setValue("rating", v)}
                onKeyDown={(e) => {
                  const cur = Number(currentRating ?? 1);
                  if (e.key === "ArrowLeft" || e.key === "ArrowDown") setValue("rating", Math.max(1, cur - 1));
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") setValue("rating", Math.min(5, cur + 1));
                }}
                onMouseEnter={() => setHover(v)}
                onMouseLeave={() => setHover(null)}
                className={`inline-flex items-center justify-center rounded px-2 py-1 text-xl leading-none focus:outline-none ${filled ? 'text-yellow-400' : 'text-slate-300'}`}
                title={`${v} star${v > 1 ? 's' : ''}`}
              >
                <span aria-hidden>{filled ? '★' : '☆'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Comment</label>
        <textarea
          {...register("comment")}
          rows={3}
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Optional - share your experience"
        />
        {errors.comment && <div className="mt-1 text-xs text-rose-600">{errors.comment.message}</div>}
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>

      {errors.rating && <div className="text-rose-600 text-sm">{errors.rating.message}</div>}
    </form>
  );
};

export default ReviewForm;
