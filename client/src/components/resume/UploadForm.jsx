
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
const MAX_JOB_DESCRIPTION = 20_000;
const MAX_CUSTOM_INSTRUCTIONS = 2_000;
const EXTENSIONS = ['pdf', 'docx'];

const textareaClass = `
  w-full resize-y rounded-field border border-border
  bg-surface px-4 py-3 text-[13.5px] leading-[1.75]
  text-text placeholder:text-text-tertiary
  outline-none transition-all duration-150
  focus:border-border-focus focus:ring-4 focus:ring-brand-soft
`;

function fileProblem(file) {
  if (!file) return 'Choose a PDF or DOCX file.';

  const extension = String(file.name).split('.').pop()?.toLowerCase();

  if (!EXTENSIONS.includes(extension)) {
    return 'Upload your resume as a PDF or DOCX file.';
  }

  if (!file.size) return 'That file is empty.';
  if (file.size > MAX_BYTES) return 'Resume must be 10 MB or smaller.';

  return '';
}

export function UploadForm() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const create = useCreateResume();
  const jdId = useId();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [error, setError] = useState('');

  function chooseFile(next) {
    const problem = fileProblem(next);

    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setFile(next);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Attach your resume first.');
      return;
    }

    if (jobDescription.trim().length < 60) {
      setError(
        'Paste the job description (at least a few lines) so there is something to compare against.'
      );
      return;
    }

    setError('');

    try {
      const analysis = await create.mutateAsync({
        file,
        jobDescription: jobDescription.trim(),
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        customInstructions: customInstructions.trim(),
      });

      navigate(`/resume-intelligence/${analysis.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {/* Resume upload */}
      <section className="flex flex-col gap-3">
        <div>
          <label className="text-[13px] font-semibold text-text">
            Resume <span className="text-error">*</span>
          </label>
          <p className="m-0 mt-1 text-[12px] text-text-tertiary">
            Upload the resume you want to evaluate.
          </p>
        </div>

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
          onDrop={onDrop}
          className={`
            flex min-h-[190px] flex-col items-center justify-center
            rounded-xl border-2 border-dashed px-5 py-7 text-center
            transition-all duration-200
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
                  setFile(null);
                  setError('');
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
                {dragging ? 'Drop your resume here' : 'Drag and drop your resume'}
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
          aria-label="Resume file"
          onChange={(event) => {
            chooseFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <p className="m-0 text-[11.5px] leading-relaxed text-text-tertiary">
          Your file is read to extract its text and then discarded. Only the
          extracted text is retained.
        </p>
      </section>

      <div className="h-px bg-border-secondary" />

      {/* Job description */}
      <section className="flex flex-col gap-3">
        <div>
          <label
            htmlFor={jdId}
            className="text-[13px] font-semibold text-text"
          >
            Job description <span className="text-error">*</span>
          </label>

          <p className="m-0 mt-1 text-[12px] text-text-tertiary">
            Include the responsibilities, qualifications, and required skills.
          </p>
        </div>

        <textarea
          id={jdId}
          required
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
          placeholder="For example: I'm transitioning from backend to platform engineering. Focus on the skills I need to develop first."
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
          Your report will include a scored evaluation and detailed recommendations
          to help you prepare for the role.
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
