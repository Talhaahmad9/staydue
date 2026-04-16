"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CardShuffle from "@/components/shared/CardShuffle";

interface Testimonial {
  quote: string;
  name: string;
  batch: string;
  course: string;
  photoSrc?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I used to open Moodle every morning just to check if something was due. StayDue sends a WhatsApp message and I don't have to think about it anymore.",
    name: "Sarah A.",
    batch: "Batch 2023",
    course: "Business Administration",
    photoSrc: undefined,
  },
  {
    quote:
      "Submitted an assignment 20 minutes before the deadline because StayDue reminded me the same morning. Without it I would have completely missed it.",
    name: "Hassan R.",
    batch: "Batch 2022",
    course: "Computer Science",
    photoSrc: undefined,
  },
  {
    quote:
      "The dashboard shows everything in one place. I filter by subject and know exactly what's coming up this week. Actually changed how I manage my semester.",
    name: "Maham K.",
    batch: "Batch 2024",
    course: "Finance",
    photoSrc: undefined,
  },
];

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
        {testimonial.photoSrc ? (
          <Image
            src={testimonial.photoSrc}
            alt={testimonial.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
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

export default function TestimonialsSection(): React.ReactElement {
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

      <div className="max-w-sm mx-auto sm:max-w-xl lg:max-w-2xl">
        <CardShuffle interval={5000}>
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </CardShuffle>
      </div>
    </section>
  );
}
