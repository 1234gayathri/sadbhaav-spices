import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Image as ImageIcon, MessageSquare, Trash2, ImagePlus, Plus, X } from "lucide-react";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getContentFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getBanners, getTestimonials } = await import("@/lib/db");
  return { banners: getBanners(), testimonials: getTestimonials() };
});

export const addBannerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string; image: string }) => data)
  .handler(async ({ data }) => {
    const { addBanner } = await import("@/lib/db");
    return addBanner({ text: data.text, image: data.image });
  });

export const deleteBannerFn = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { deleteBanner } = await import("@/lib/db");
    return deleteBanner(id);
  });

export const addTestimonialFn = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; quote: string }) => data)
  .handler(async ({ data }) => {
    const { addTestimonial } = await import("@/lib/db");
    return addTestimonial(data);
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { deleteTestimonial } = await import("@/lib/db");
    return deleteTestimonial(id);
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/content")({
  component: Content,
  loader: () => getContentFn(),
  head: () => ({ meta: [{ title: "Content — Sadbhaav Admin" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function Content() {
  const router = useRouter();
  const { banners, testimonials } = Route.useLoaderData();
  
  // Banner states
  const [modal, setModal] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Testimonial states
  const [tModal, setTModal] = useState(false);
  const [tName, setTName] = useState("");
  const [tQuote, setTQuote] = useState("");
  const [isTSubmitting, setIsTSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddBanner = async () => {
    if (!bannerText) return;
    setIsSubmitting(true);
    try {
      await addBannerFn({ data: { text: bannerText, image: bannerImage } });
      setModal(false);
      setBannerText("");
      setBannerImage("");
      await router.invalidate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm("Delete this banner?")) {
      await deleteBannerFn({ data: id });
      await router.invalidate();
    }
  };

  const handleAddTestimonial = async () => {
    if (!tName || !tQuote) return;
    setIsTSubmitting(true);
    try {
      await addTestimonialFn({ data: { name: tName, quote: tQuote } });
      setTModal(false);
      setTName("");
      setTQuote("");
      await router.invalidate();
    } finally {
      setIsTSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm("Delete this testimonial?")) {
      await deleteTestimonialFn({ data: id });
      await router.invalidate();
    }
  };

  return (
    <AdminShell title="Content" subtitle="Manage banners, testimonials and homepage sections.">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Banners */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold">Homepage banners</h3>
            <button
              onClick={() => setModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add banner
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {banners.map((b, i) => (
              <div key={b.id} className="flex items-center gap-4 rounded-xl border p-3">
                <img
                  src={b.image}
                  alt=""
                  className="h-14 w-20 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x56"; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{b.text}</div>
                  <div className="text-xs text-muted-foreground">Position #{i + 1}</div>
                </div>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive flex-shrink-0 cursor-pointer"
                  title="Delete banner"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No banners yet. Add your first banner!
              </div>
            )}
          </div>
        </div>

        {/* Testimonials */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Testimonials
            </h3>
            <button
              onClick={() => setTModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add quote
            </button>
          </div>
          <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {testimonials.map((t) => (
              <div key={t.id} className="group relative rounded-xl border p-3.5 text-sm hover:border-primary/50 transition">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold">{t.name}</div>
                  <button
                    onClick={() => handleDeleteTestimonial(t.id)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Delete quote"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground italic leading-relaxed">"{t.quote}"</div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No testimonials yet. Add the first quote!
              </div>
            )}
          </div>
        </div>

        {/* Upload CTA */}
        <div
          onClick={() => setModal(true)}
          className="lg:col-span-3 rounded-2xl border border-dashed bg-card/50 p-10 text-center cursor-pointer hover:bg-muted/30 transition"
        >
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <div className="mt-3 font-semibold">Upload promotional media</div>
          <p className="mt-1 text-sm text-muted-foreground">Click here to add a new banner with image</p>
        </div>
      </div>

      {/* Add Banner Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4"
          onClick={() => setModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-elegant"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-semibold">Add new banner</h3>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Banner Text</span>
                <input
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="e.g. 50% Off Summer Sale!"
                  className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              <div className="block">
                <span className="text-xs text-muted-foreground">Banner Image</span>
                <div className="mt-1 relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/30 py-8 text-sm text-muted-foreground hover:bg-muted/50 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {bannerImage ? (
                    <img
                      src={bannerImage}
                      alt="Preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <><ImagePlus className="mr-2 h-5 w-5" /> Click to upload</>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModal(false)}
                className="rounded-full border px-5 py-2 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBanner}
                disabled={isSubmitting || !bannerText}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving…" : "Save banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Testimonial Modal */}
      {tModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4"
          onClick={() => setTModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-elegant"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-semibold">Add new testimonial</h3>
              <button onClick={() => setTModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Customer Name & Location</span>
                <input
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Priya · Bengaluru"
                  className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="text-xs text-muted-foreground">Customer Quote</span>
                <textarea
                  rows={4}
                  value={tQuote}
                  onChange={(e) => setTQuote(e.target.value)}
                  placeholder="e.g. The spices are incredibly fresh, and the aroma is beautiful!"
                  className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setTModal(false)}
                className="rounded-full border px-5 py-2 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTestimonial}
                disabled={isTSubmitting || !tName || !tQuote}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background disabled:opacity-50 cursor-pointer"
              >
                {isTSubmitting ? "Saving…" : "Save quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
