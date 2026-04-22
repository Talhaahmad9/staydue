import { getAdminTestimonials } from "@/lib/admin";
import TestimonialAdminList from "@/components/admin/testimonials/TestimonialAdminList";
import CreateTestimonialForm from "@/components/admin/testimonials/CreateTestimonialForm";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();
  const visible = testimonials.filter((t) => t.isVisible).length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Testimonials</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {testimonials.length} total · {visible} visible on landing page
          </p>
        </div>
        <CreateTestimonialForm />
      </div>

      <TestimonialAdminList testimonials={testimonials} />
    </div>
  );
}
