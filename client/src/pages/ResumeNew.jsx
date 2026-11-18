
import { FaFileLines } from 'react-icons/fa6';

import { Card } from '../components/ui/Card.jsx';
import { UploadForm } from '../components/resume/UploadForm.jsx';

export default function ResumeNew() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      <Card className="mt-7 p-5 sm:mt-9 sm:p-8">


        <UploadForm />
      </Card>

      <p className="mx-auto mb-0 mt-5 max-w-xl text-center text-[11.5px] leading-relaxed text-text-tertiary">
        Your resume and job description are used to generate your analysis report.
      </p>
    </div>
  );
}
