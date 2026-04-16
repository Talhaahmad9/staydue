const TUTORIAL_VIDEO_ID = "PLACEHOLDER";

interface TutorialStep {
  number: number;
  title: string;
  description: string;
  imageAlt: string;
}

const steps: TutorialStep[] = [
  {
    number: 1,
    title: "Log in to IOBM Moodle",
    description:
      "Go to lms.iobm.edu.pk and sign in with your student credentials — your student ID (e.g. 12345) and your Moodle password.",
    imageAlt:
      "Screenshot of the IOBM Moodle login page at lms.iobm.edu.pk showing the username and password fields",
  },
  {
    number: 2,
    title: "Open the Calendar",
    description:
      'On your Moodle dashboard, look for the Calendar block in the right panel. Alternatively, click the grid icon in the top navigation bar and select "Calendar" from the dropdown.',
    imageAlt:
      "Screenshot of the Moodle dashboard showing the Calendar block in the right sidebar panel",
  },
  {
    number: 3,
    title: 'Click "Export calendar"',
    description:
      "Scroll to the very bottom of the Calendar page. You will find an \"Export calendar\" link. Click it to open the export options.",
    imageAlt:
      'Screenshot of the bottom of the Moodle Calendar page with the "Export calendar" link visible',
  },
  {
    number: 4,
    title: "Configure the export options",
    description:
      'Under "Events to export", select "All events". Under "For", select "All courses". Leave the time range at the default setting (it covers the current and upcoming months).',
    imageAlt:
      'Screenshot of the Moodle calendar export dialog showing "All events" and "All courses" selected',
  },
  {
    number: 5,
    title: 'Copy the export URL',
    description:
      'Click "Get calendar URL". A long URL will appear — it starts with: https://lms.iobm.edu.pk/moodle/calendar/export_execute.php?userid=...&authtoken=... — select all of it and copy the full URL.',
    imageAlt:
      "Screenshot of the Moodle export URL field showing the full ICS export URL after clicking Get calendar URL",
  },
  {
    number: 6,
    title: "Paste it in StayDue",
    description:
      "In StayDue onboarding, paste the full URL into the Calendar URL field. Select your admission year, then click Sync deadlines. Your assignments will be imported automatically.",
    imageAlt:
      "Screenshot of the StayDue onboarding page with the Calendar URL field filled in and the Sync deadlines button",
  },
];

export default function TutorialContent(): React.ReactElement {
  return (
    <div className="space-y-12">
      {/* Video embed */}
      <div className="space-y-3">
        <h2 className="text-base md:text-lg font-medium text-text-primary">Video walkthrough</h2>
        {TUTORIAL_VIDEO_ID === "PLACEHOLDER" ? (
          <div className="w-full aspect-video bg-page-surface border border-line/50 rounded-xl flex items-center justify-center">
            <p className="text-xs text-text-muted">Video will be added here</p>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-line/50">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_VIDEO_ID}?rel=0&modestbranding=1`}
              title="How to get your IOBM Moodle calendar URL"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Step-by-step */}
      <div className="space-y-3">
        <h2 className="text-base md:text-lg font-medium text-text-primary">Step-by-step guide</h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-brand-light border border-brand/30 inline-flex items-center justify-center text-xs font-medium text-brand shrink-0 mt-0.5">
                  {step.number}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm md:text-base font-medium text-text-primary">{step.title}</h3>
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Image slot — replace the placeholder div with an <Image> once screenshots are ready */}
              {/* <Image
                src={`/tutorial/step-${step.number}.png`}
                alt={step.imageAlt}
                width={900}
                height={506}
                className="w-full rounded-lg border border-line/50"
              /> */}
              <div className="flex items-start gap-4">
                <span className="w-8 shrink-0" aria-hidden="true" />
                <div
                  className="flex-1 aspect-video bg-page-surface border border-line/50 rounded-lg flex items-center justify-center min-w-0"
                  aria-label={step.imageAlt}
                >
                  <p className="text-xs text-text-muted px-4 text-center">{step.imageAlt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-line-subtle pt-8">
        <p className="text-sm md:text-base text-text-secondary mb-4">
          Once you have your URL, come back and paste it in StayDue.
        </p>
        <a
          href="https://lms.iobm.edu.pk/moodle/calendar/export.php"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          Open IOBM Moodle export page
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
