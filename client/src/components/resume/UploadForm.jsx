
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
import { Textarea } from '../ui/Textarea.jsx';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_RESUME_TEXT = 120_000;
const MAX_JOB_DESCRIPTION = 20_000;
const MAX_CUSTOM_INSTRUCTIONS = 2_000;
const MIN_RESUME_CHARACTERS = 150;
const MIN_JOB_DESCRIPTION = 60;
const EXTENSIONS = ['pdf', 'docx'];

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

function SourceSwitch({ label, value, onChange }) {
  const options = [
    { key: 'file', label: 'Upload file' },
    { key: 'text', label: 'Paste text' },
  ];

  return (
    <div
      role="group"
      aria-label={`${label} input type`}
      className="inline-flex shrink-0 rounded-button border border-border bg-surface-secondary p-0.5"
    >
      {options.map((option) => {
        const active = option.key === value;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={`rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active
              ? 'bg-surface text-text shadow-card'
              : 'text-text-tertiary hover:text-text-secondary'
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function DropZone({ label, file, onChoose, onClear }) {
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
        className={`flex min-h-[140px] flex-col items-center justify-center rounded-field border px-5 py-6 text-center transition-colors ${dragging
          ? 'border-brand bg-brand-soft'
          : 'border-border bg-surface-secondary hover:border-brand-light'
          }`}
      >
        {file ? (
          <>
            <FaFileLines
              aria-hidden="true"
              className="text-lg text-brand"
            />

            <p className="mb-0 mt-3 max-w-full truncate text-sm font-medium text-text">
              {file.name}
            </p>

            <p className="m-0 mt-1 text-xs text-text-tertiary">
              {formatFileSize(file.size)}
            </p>

            <button
              type="button"
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-button px-2 py-1 text-xs text-text-secondary transition-colors hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FaXmark aria-hidden="true" />
              Remove file
            </button>
          </>
        ) : (
          <>
            <FaArrowUpFromBracket
              aria-hidden="true"
              className="text-lg text-text-secondary"
            />

            <p className="m-0 mt-3 text-sm font-medium text-text">
              {dragging
                ? `Drop your ${label} here`
                : `Drag and drop your ${label}`}
            </p>

            <p className="m-0 mt-1 text-xs text-text-tertiary">
              PDF or DOCX · Maximum 10 MB
            </p>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
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

function FormSection({ title, description, required, aside, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-sm font-semibold text-text">
            {title}
            {required && <span className="ml-1 text-error">*</span>}
          </h2>

          {description && (
            <p className="m-0 mt-1 text-xs leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
        </div>

        {aside}
      </div>

      {children}
    </section>
  );
}

export function UploadForm() {
  const navigate = useNavigate();
  const create = useCreateResume();
  const jdId = useId();

  const [resumeSource, setResumeSource] = useState('file');
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');

  const [jdSource, setJdSource] = useState('file');
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

    if (
      resumeSource === 'text' &&
      resumeText.trim().length < MIN_RESUME_CHARACTERS
    ) {
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
      <FormSection
        title="Resume"
        description="Upload your resume or paste its text."
        required
        aside={
          <SourceSwitch
            label="Resume"
            value={resumeSource}
            onChange={setResumeSource}
          />
        }
      >
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

            <p className="m-0 text-xs leading-relaxed text-text-tertiary">
              Your file is read to extract its text and then discarded. Only
              the extracted text is retained.
            </p>
          </>
        ) : (
          <>
            <Textarea
              value={resumeText}
              onChange={(event) =>
                setResumeText(event.target.value.slice(0, MAX_RESUME_TEXT))
              }
              placeholder="Paste your resume here..."
              aria-label="Resume text"
              className="min-h-[240px]"
            />

            <p className="m-0 text-right text-xs tabular-nums text-text-tertiary">
              {resumeText.length.toLocaleString()} / {MAX_RESUME_TEXT.toLocaleString()}
            </p>
          </>
        )}
      </FormSection>

      <FormSection
        title="Job description"
        description="Include the responsibilities, qualifications, and required skills."
        required
        aside={
          <SourceSwitch
            label="Job description"
            value={jdSource}
            onChange={setJdSource}
          />
        }
      >
        {jdSource === 'text' ? (
          <>
            <Textarea
              id={jdId}
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value.slice(0, MAX_JOB_DESCRIPTION)
                )
              }
              placeholder="Paste the full job description here..."
              className="min-h-[200px]"
            />

            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-xs text-text-tertiary">
                At least {MIN_JOB_DESCRIPTION} characters required
              </p>

              <p className="m-0 shrink-0 text-xs tabular-nums text-text-tertiary">
                {jobDescription.length.toLocaleString()} / {MAX_JOB_DESCRIPTION.toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <DropZone
            label="job description"
            file={jdFile}
            onChoose={(next) =>
              chooseFile(next, 'job description', setJdFile)
            }
            onClear={() => {
              setJdFile(null);
              setError('');
            }}
          />
        )}
      </FormSection>

      <FormSection
        title="Additional details"
        description="Optional company information and instructions."
      >
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

        <Textarea
          label="Additional instructions"
          value={customInstructions}
          onChange={(event) =>
            setCustomInstructions(
              event.target.value.slice(0, MAX_CUSTOM_INSTRUCTIONS)
            )
          }
          placeholder="What should the review focus on?"
          className="min-h-[100px]"
        />

        <p className="m-0 text-right text-xs tabular-nums text-text-tertiary">
          {customInstructions.length.toLocaleString()} / {MAX_CUSTOM_INSTRUCTIONS.toLocaleString()}
        </p>
      </FormSection>

      {error && <Alert>{error}</Alert>}

      <Button
        type="submit"
        loading={create.isPending}
        className="w-full shrink-0 sm:w-auto"
      >
        {create.isPending ? 'Analysing…' : 'Analyse my resume'}
      </Button>
    </form>
  );
}
