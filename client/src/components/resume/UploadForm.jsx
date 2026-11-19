import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowUpFromBracket,
  FaFileLines,
  FaXmark,
} from 'react-icons/fa6';

import { useCreateResume } from '../../hooks/useResume.js';
import { formatFileSize } from '../../utils/format.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_RESUME_TEXT = 120_000;
const MAX_JOB_DESCRIPTION = 20_000;
const MAX_CUSTOM_INSTRUCTIONS = 2_000;
const MIN_RESUME_CHARACTERS = 150;
const MIN_JOB_DESCRIPTION = 60;
const EXTENSIONS = ['pdf', 'docx'];

const textareaClass = `
  w-full resize-y rounded-field border border-border
  bg-surface px-4 py-3 text-[13.5px] leading-[1.75]
  text-text placeholder:text-text-tertiary
  outline-none transition-all duration-150
  focus:border-border-focus focus:ring-4 focus:ring-brand-soft
`;

function fileProblem(file, label) {
  if (!file) return `Choose a PDF or DOCX file for the ${label}.`;

  const extension = String(file.name).split('.').pop()?.toLowerCase();

  if (!EXTENSIONS.includes(extension)) {
    return `Upload the ${label} as a PDF or DOCX file.`;
  }

  if (!file.size) return 'That file is empty.';
  if (file.size > MAX_BYTES) return 'Each file must be 10 MB or smaller.';

  return '';
}

/** File / pasted-text switch for one side of the comparison. */
function SourceSwitch({ label, value, onChange }) {
  const options = [
    { key: 'file', label: 'Upload file' },
    { key: 'text', label: 'Paste text' },
  ];

  return (
    <div
      role="group"
      aria-label={`${label} input type`}
      className="inline-flex shrink-0 rounded-full border border-border bg-surface-secondary p-0.5"
    >
      {options.map((option) => {
        const active = option.key === value;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={`
              rounded-full px-3 py-1.5 text-[11.5px] font-medium
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-brand-active
              ${active
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function DropZone({ label, file, onChoose, onClear, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onChoose(event.dataTransfer.files?.[0]);
        }}
        className={`
          flex flex-col items-center justify-center rounded-xl border-2
          border-dashed px-5 text-center transition-all duration-200
          ${compact ? 'min-h-[150px] py-6' : 'min-h-[190px] py-7'}
          ${dragging
            ? 'border-[#91C879] bg-brand-soft'
            : 'border-border bg-surface-secondary hover:border-[#C8DDBD] hover:bg-[#FAFCF8]'
          }
        `}
      >
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
              <FaFileLines
                aria-hidden="true"
                className="text-[19px] text-[#527C42]"
              />
            </div>

            <p className="mb-0 mt-3 max-w-full truncate text-[13.5px] font-semibold text-text">
              {file.name}
            </p>

            <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
              {formatFileSize(file.size)}
            </p>

            <button
              type="button"
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="
                mt-3 inline-flex items-center gap-1.5 rounded-lg
                px-3 py-1.5 text-[12px] font-medium text-text-secondary
                transition-colors hover:bg-surface-tertiary hover:text-error
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-brand-active
              "
            >
              <FaXmark aria-hidden="true" className="text-[11px]" />
              Remove file
            </button>
          </>
        ) : (
          <>
            <div
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl
                transition-colors
                ${dragging ? 'bg-white' : 'bg-brand-soft'}
              `}
            >
              <FaArrowUpFromBracket
                aria-hidden="true"
                className="text-[19px] text-[#527C42]"
              />
            </div>

            <p className="m-0 mt-3 text-[13.5px] font-semibold text-text">
              {dragging ? `Drop your ${label} here` : `Drag and drop your ${label}`}
            </p>

            <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
              PDF or DOCX · Maximum file size 10 MB
            </p>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </Button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        aria-label={`${label} file`}
        onChange={(event) => {
          onChoose(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export function UploadForm() {
  const navigate = useNavigate();
  const create = useCreateResume();
  const jdId = useId();

  const [resumeSource, setResumeSource] = useState('file');
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');

  const [jdSource, setJdSource] = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jdFile, setJdFile] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [error, setError] = useState('');

  function chooseFile(next, label, setter) {
    const problem = fileProblem(next, label);

    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setter(next);
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (resumeSource === 'file' && !file) {
      setError('Attach your resume, or switch to pasted text.');
      return;
    }

    if (resumeSource === 'text' && resumeText.trim().length < MIN_RESUME_CHARACTERS) {
      setError('Paste your full resume text so there is something to review.');
      return;
    }

    if (jdSource === 'file' && !jdFile) {
      setError('Attach the job description, or switch to pasted text.');
      return;
    }

    if (
      jdSource === 'text' &&
      jobDescription.trim().length < MIN_JOB_DESCRIPTION
    ) {
      setError(
        'Paste the job description (at least a few lines) so there is something to compare against.'
      );
      return;
    }

    setError('');

    try {
      const analysis = await create.mutateAsync({
        file: resumeSource === 'file' ? file : null,
        resumeText: resumeSource === 'text' ? resumeText.trim() : '',
        jobDescription: jdSource === 'text' ? jobDescription.trim() : '',
        jobDescriptionFile: jdSource === 'file' ? jdFile : null,
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        customInstructions: customInstructions.trim(),
      });

      navigate(`/resume-analysis/${analysis.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {/* Resume */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <label className="text-[13px] font-semibold text-text">
              Resume <span className="text-error">*</span>
            </label>
            <p className="m-0 mt-1 text-[12px] text-text-tertiary">
              Upload the resume you want to evaluate, or paste its text.
            </p>
          </div>

          <SourceSwitch
            label="Resume"
            value={resumeSource}
            onChange={setResumeSource}
          />
        </div>

        {resumeSource === 'file' ? (
          <>
            <DropZone
              label="resume"
              file={file}
              onChoose={(next) => chooseFile(next, 'resume', setFile)}
              onClear={() => {
                setFile(null);
                setError('');
              }}
            />

            <p className="m-0 text-[11.5px] leading-relaxed text-text-tertiary">
              Your file is read to extract its text and then discarded. Only the
              extracted text is retained.
            </p>
          </>
        ) : (
          <>
            <textarea
              value={resumeText}
              onChange={(event) =>
                setResumeText(event.target.value.slice(0, MAX_RESUME_TEXT))
              }
              placeholder="Paste your resume here — summary, experience, projects, skills, education..."
              className={`${textareaClass} min-h-[260px]`}
              aria-label="Resume text"
            />

            <p className="m-0 text-right text-[11.5px] tabular-nums text-text-tertiary">
              {resumeText.length.toLocaleString()} / {MAX_RESUME_TEXT.toLocaleString()}
            </p>
          </>
        )}
      </section>

      <div className="h-px bg-border-secondary" />

      {/* Job description */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <label htmlFor={jdId} className="text-[13px] font-semibold text-text">
              Job description <span className="text-error">*</span>
            </label>
            <p className="m-0 mt-1 text-[12px] text-text-tertiary">
              Paste the posting, or upload it as a file. Include the
              responsibilities, qualifications and required skills.
            </p>
          </div>

          <SourceSwitch
            label="Job description"
            value={jdSource}
            onChange={setJdSource}
          />
        </div>

        {jdSource === 'text' ? (
          <>
            <textarea
              id={jdId}
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value.slice(0, MAX_JOB_DESCRIPTION))
              }
              placeholder="Paste the full job description here..."
              className={`${textareaClass} min-h-[220px]`}
            />

            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-[11.5px] text-text-tertiary">
                At least 60 characters required
              </p>

              <p className="m-0 shrink-0 text-[11.5px] tabular-nums text-text-tertiary">
                {jobDescription.length.toLocaleString()} / {MAX_JOB_DESCRIPTION.toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <DropZone
            label="job description"
            compact
            file={jdFile}
            onChoose={(next) => chooseFile(next, 'job description', setJdFile)}
            onClear={() => {
              setJdFile(null);
              setError('');
            }}
          />
        )}
      </section>

      <div className="h-px bg-border-secondary" />

      {/* Optional company details */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="m-0 text-[13px] font-semibold text-text">
            Company details
            <span className="ml-2 text-[11px] font-normal text-text-tertiary">
              Optional
            </span>
          </h3>

          <p className="m-0 mt-1 text-[12px] text-text-tertiary">
            Add context about the company for a more informed analysis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company name"
            value={companyName}
            maxLength={120}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="e.g. Acme"
          />

          <Input
            label="Company website"
            value={companyWebsite}
            maxLength={300}
            onChange={(event) => setCompanyWebsite(event.target.value)}
            placeholder="e.g. acme.com"
          />
        </div>
      </section>

      {/* Custom instructions */}
      <section className="flex flex-col gap-3">
        <div>
          <label
            htmlFor={`${jdId}-instructions`}
            className="text-[13px] font-semibold text-text"
          >
            Additional instructions
            <span className="ml-2 text-[11px] font-normal text-text-tertiary">
              Optional
            </span>
          </label>

          <p className="m-0 mt-1 text-[12px] text-text-tertiary">
            Tell the AI about anything specific you want it to consider.
          </p>
        </div>

        <textarea
          id={`${jdId}-instructions`}
          value={customInstructions}
          onChange={(event) =>
            setCustomInstructions(
              event.target.value.slice(0, MAX_CUSTOM_INSTRUCTIONS)
            )
          }
          placeholder="For example: I'm targeting backend roles and my resume has no metrics. I want the strongest lines to fix first."
          className={`${textareaClass} min-h-[110px]`}
        />

        <p className="m-0 text-right text-[11.5px] tabular-nums text-text-tertiary">
          {customInstructions.length.toLocaleString()} / {MAX_CUSTOM_INSTRUCTIONS.toLocaleString()}
        </p>
      </section>

      {/* Form feedback */}
      {error && <Alert>{error}</Alert>}

      {/* Submit */}
      <div className="flex flex-col gap-4 border-t border-border-secondary pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 max-w-sm text-[11.5px] leading-relaxed text-text-tertiary">
          Your report will review this resume against the role and give you the
          exact lines to paste in.
        </p>

        <Button
          type="submit"
          disabled={create.isPending}
          className="w-full shrink-0 sm:w-auto"
        >
          {create.isPending ? 'Uploading and analysing…' : 'Analyse my resume'}
        </Button>
      </div>
    </form>
  );
}
