"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function MiniAboutSection(): React.ReactElement {
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium">
            About StayDue
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
            Built because we kept missing deadlines.
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            StayDue started as a personal project by{" "}
            <a
              href="https://talhaahmad.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand-hover transition-colors font-medium"
            >
              Talha Ahmad
            </a>
            {" "}— an IOBM student who got tired
            of opening Moodle every morning just to check if something was due. Moodle does not
            send push notifications. Deadlines would appear, get buried in a course page, and pass
            without warning.
          </p>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            So we built the tool we wished existed — one that reads your Moodle calendar,
            understands your courses, and tells you when something is due before it is too late.
            Built solo, for IOBM students first.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover transition-colors pt-1"
          >
            Read more about the project
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
