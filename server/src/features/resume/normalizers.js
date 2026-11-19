import { ApiError } from '../../shared/errors.js';

// Strict(ish) normalisation of model output.
//
// The model is asked for one JSON object. Everything here clamps, trims and
// drops unusable items so a slightly malformed answer cannot break a stored
// report, while a response with no usable content fails the stage so it can be
// retried instead of showing an empty review.

const SKILL_PRIORITIES = ['Must', 'Nice'];
const EDIT_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const EDIT_SECTIONS = ['Summary', 'Experience', 'Projects', 'Skills', 'Education', 'Other'];
const EDIT_ACTIONS = ['Rewrite', 'Add', 'Quantify', 'Remove', 'Reorder'];

const BAD_JSON = 'The AI returned a response that could not be read. Please try again.';
const EMPTY_REPORT = 'The AI returned an empty report. Please try again.';

function fail(message = BAD_JSON) {
  throw new ApiError(502, message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asText(value, max = 1200) {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}

function asMultiline(value, max = 2000) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function asChoice(value, allowed, fallback) {
  const text = asText(value, 40).toLowerCase();
  const match = allowed.find((option) => option.toLowerCase() === text);
  return match ?? fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return isObject(value) ? value : {};
}

/** Keep the first item for each key, dropping empty keys. */
function uniqueBy(items, key) {
  const seen = new Set();

  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function edit(value) {
  const raw = asObject(value);
  const after = asMultiline(raw.after, 900);
  if (!after) return null;

  const section = asChoice(raw.section, EDIT_SECTIONS, 'Other');

  return {
    priority: asChoice(raw.priority, EDIT_PRIORITIES, 'Medium'),
    section,
    target: asText(raw.target, 180) || section,
    action: asChoice(raw.action, EDIT_ACTIONS, 'Rewrite'),
    before: asText(raw.before, 500),
    after,
    reason: asText(raw.reason, 500),
  };
}

/** A strong point: short label plus the explanation. */
function point(value) {
  const raw = asObject(value);
  const title = asText(raw.title, 160);
  const detail = asMultiline(raw.detail, 900);
  if (!title && !detail) return null;

  return { title: title || detail.slice(0, 160), detail };
}

/** A weak point, which also carries how much it hurts this application. */
function gap(value) {
  const base = point(value);
  if (!base) return null;

  const raw = asObject(value);

  return {
    ...base,
    severity: asChoice(raw.severity, EDIT_PRIORITIES, 'Medium'),
  };
}

/** A skill the posting asks for and the resume does not show. */
function missingSkill(value) {
  const raw = asObject(value);
  const skill = asText(raw.skill, 120);
  if (!skill) return null;

  return {
    skill,
    priority: asChoice(raw.priority, SKILL_PRIORITIES, 'Must'),
    detail: asMultiline(raw.detail, 700),
  };
}

/** The report stored on ResumeAnalysis.analysis. */
export function normalizeAnalysis(raw) {
  const data = asObject(raw);

  const summary = asMultiline(data.summary, 2200);

  const strengths = uniqueBy(
    asArray(data.strengths).map(point).filter(Boolean),
    (item) => item.title.toLowerCase()
  ).slice(0, 6);

  const gaps = uniqueBy(
    asArray(data.gaps).map(gap).filter(Boolean),
    (item) => item.title.toLowerCase()
  ).slice(0, 7);

  const missingSkills = uniqueBy(
    asArray(data.missingSkills).map(missingSkill).filter(Boolean),
    (item) => item.skill.toLowerCase()
  ).slice(0, 12);

  const edits = uniqueBy(
    asArray(data.edits).map(edit).filter(Boolean),
    (item) => item.after.toLowerCase()
  ).slice(0, 25);

  if (
    !summary &&
    !strengths.length &&
    !gaps.length &&
    !missingSkills.length &&
    !edits.length
  ) {
    fail(EMPTY_REPORT);
  }

  return {
    version: 4,
    summary,
    strengths,
    gaps,
    missingSkills,
    edits,
  };
}
