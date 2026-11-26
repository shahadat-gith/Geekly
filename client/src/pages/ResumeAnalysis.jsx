
import { UploadForm } from '../components/resume/UploadForm.jsx';

export default function ResumeAnalysis() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="min-w-0 rounded-card border border-border bg-surface p-5 sm:p-8">
        <UploadForm />
      </div>
    </div>
  );
}
