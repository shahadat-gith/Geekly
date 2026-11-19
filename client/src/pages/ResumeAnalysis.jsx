import { Card } from '../components/ui/Card.jsx';
import { UploadForm } from '../components/resume/UploadForm.jsx';

export default function ResumeAnalysis() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div>
        <h1 className="m-0 font-heading text-[26px] font-semibold leading-[1.15] tracking-[-0.035em] text-text sm:text-[32px]">
          Review a resume
        </h1>

        <p className="m-0 mt-2 max-w-xl text-[13.5px] leading-[1.75] text-text-secondary">
          Give us the resume you are sending and the job description you are
          targeting. You get the requirement match and the exact text to paste
          into the resume.
        </p>
      </div>

      <Card className="mt-7 p-5 sm:mt-9 sm:p-8">
        <UploadForm />
      </Card>

      <p className="mx-auto mb-0 mt-5 max-w-xl text-center text-[11.5px] leading-relaxed text-text-tertiary">
        Your resume and job description are used to generate your analysis report.
      </p>
    </div>
  );
}
