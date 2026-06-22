import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import api from "../services/api";

export function ReviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6 text-center">Application Reviews</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8 text-center">Share your experience using SEAPEDIA</p>
      <ReviewForm onSubmitted={() => {}} />
    </div>
  );
}

export function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [form, setForm] = useState({ reviewerName: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", form);
      setSubmitted(true);
      setForm({ reviewerName: "", rating: 5, comment: "" });
      onSubmitted();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-lg font-medium text-[var(--color-text)] mb-2">Thank you for your review!</p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Write another</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-lg font-bold text-[var(--color-text)]">Leave a Review</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Tell us about your SEAPEDIA experience</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Your Name" value={form.reviewerName} onChange={(e) => setForm({ ...form, reviewerName: e.target.value })} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setForm({ ...form, rating: i + 1 })}>
                  <svg className={`w-8 h-8 ${i < form.rating ? "text-[var(--color-warning)]" : "text-[var(--color-border-strong)]"} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">Comment</label>
            <textarea
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg-card)] text-[var(--color-text)]"
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">Submit Review</Button>
        </form>
      </CardContent>
    </Card>
  );
}
