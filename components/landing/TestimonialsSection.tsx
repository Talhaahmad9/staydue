"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CardShuffle from "@/components/shared/CardShuffle";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  batch: string;
  course: string;
  photoUrl?: string | null;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }): React.ReactElement {
  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-page-card border border-line/50 rounded-xl p-6 flex flex-col items-center text-center gap-4">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-brand-light border border-brand/30 flex items-center justify-center overflow-hidden shrink-0">
        {testimonial.photoUrl ? (
          <Image
            src={testimonial.photoUrl}
            alt={testimonial.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-sm md:text-base font-medium text-brand">{initials}</span>
        )}
      </div>
      <div>
        <p className="text-sm md:text-base font-medium text-text-primary">{testimonial.name}</p>
        <p className="text-xs md:text-sm text-text-muted mt-0.5">
          {testimonial.batch} · {testimonial.course} · IOBM
        </p>
      </div>
      <p className="text-sm md:text-base text-text-secondary leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
    </div>
  );
}

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: Props): React.ReactElement {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium mb-3">
          From students
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
          What IOBM students say.
        </h2>
      </motion.div>

      {testimonials.length > 0 && (
        <div className="max-w-sm mx-auto sm:max-w-xl lg:max-w-2xl">
          <CardShuffle interval={5000}>
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </CardShuffle>
        </div>
      )}
    </section>
  );
}
