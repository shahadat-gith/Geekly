import { ApiError } from '../../shared/apiError.js';

// Strict(ish) normalisation of model output.
//
// The model is asked for one JSON object. Everything here clamps, trims and
// drops unusable items so a slightly malformed answer cannot break a stored
// report, while a response with no usable content fails the stage so it can be
// retried instead of showing an empty analysis.

const FINDING_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const SKILL_STATUSES = ['Strong', 'Good', 'Partial', 'Missing'];
const IMPORTANCE = ['High', 'Medium', 'Low'];
const MATCH_STATUSES = ['Strong', 'Partial', 'Not Demonstrated'];
const TOPIC_PRIORITIES = ['Must Prepare', 'Important', 'Good to Know'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const BAD_JSON = 'The AI returned a response that could not be read. Please try again.';
const EMPTY_REPORT = 'The AI returned an empty report. Please try again.';

function fail(message = BAD_JSON) {
  throw new ApiError(502, message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Pull the JSON object out of a completion, tolerating fences and stray text. */
export function extractJson(content) {
  let text = String(content ?? '').trim();
  if (!text) fail();

  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
  if (fenced) text = fenced[1].trim();

  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) fail();
    text = text.slice(start, end + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail();
  }

  if (!isObject(parsed)) fail();
  return parsed;
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

function asNumber(value, { min = 0, max = 100 } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(Math.max(Math.round(number), min), max);
}

function asBool(value) {
  return value === true || value === 'true';
}

function asChoice(value, allowed, fallback) {
  const text = asText(value, 40).toLowerCase();
  const match = allowed.find((option) => option.toLowerCase() === text);
  return match ?? fallback;
}

function asList(value, maxItems = 8, itemMax = 400) {
  if (!Array.isArray(value)) return [];
  const items = value.map((item) => asText(item, itemMax)).filter(Boolean);
  return [...new Set(items)].slice(0, maxItems);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return isObject(value) ? value : {};
}

function finding(value) {
  const raw = asObject(value);
  const title = asText(raw.title, 140);
  if (!title) return null;
  return {
    title,
    description: asText(raw.description, 1200),
    evidence: asText(raw.evidence, 800),
    priority: asChoice(raw.priority, FINDING_PRIORITIES, 'Medium'),
    suggestion: asText(raw.suggestion, 900),
  };
}

function skill(value) {
  const raw = asObject(value);
  const name = asText(raw.name, 100);
  if (!name) return null;
  return {
    name,
    status: asChoice(raw.status, SKILL_STATUSES, 'Missing'),
    importance: asChoice(raw.importance, IMPORTANCE, 'Medium'),
    evidence: asText(raw.evidence, 700),
    reason: asText(raw.reason, 700),
  };
}

function findings(value, maxItems) {
  return asArray(value).map(finding).filter(Boolean).slice(0, maxItems);
}

function skills(value, maxItems) {
  return asArray(value).map(skill).filter(Boolean).slice(0, maxItems);
}

/** A short, structured view of the resume used by later stages. */
export function normalizeProfile(raw) {
  const data = asObject(raw);

  return {
    headline: asText(data.headline, 160),
    totalYearsExperience: asNumber(data.totalYearsExperience, { min: 0, max: 60 }) ?? 0,
    roles: asArray(data.roles)
      .map((item) => {
        const role = asObject(item);
        const title = asText(role.title, 140);
        if (!title && !asText(role.company, 140)) return null;
        return {
          title,
          company: asText(role.company, 140),
          period: asText(role.period, 80),
          summary: asText(role.summary, 800),
        };
      })
      .filter(Boolean)
      .slice(0, 10),
    skills: asArray(data.skills)
      .map((item) => {
        const entry = asObject(item);
        const name = asText(entry.name, 100);
        if (!name) return null;
        return {
          name,
          level: asChoice(entry.level, ['Strong', 'Working', 'Exposure'], 'Working'),
          evidence: asText(entry.evidence, 500),
        };
      })
      .filter(Boolean)
      .slice(0, 20),
    projects: asArray(data.projects)
      .map((item) => {
        const project = asObject(item);
        const name = asText(project.name, 140);
        if (!name) return null;
        return {
          name,
          summary: asText(project.summary, 900),
          technologies: asList(project.technologies, 12, 60),
          impact: asText(project.impact, 500),
        };
      })
      .filter(Boolean)
      .slice(0, 8),
    achievements: asList(data.achievements, 10, 400),
    education: asArray(data.education)
      .map((item) => {
        const entry = asObject(item);
        const degree = asText(entry.degree, 140);
        const institution = asText(entry.institution, 140);
        if (!degree && !institution) return null;
        return { degree, institution, year: asText(entry.year, 20) };
      })
      .filter(Boolean)
      .slice(0, 6),
    certifications: asList(data.certifications, 10, 160),
  };
}

/** Explicit requirements read from the job description. */
export function normalizeRequirements(raw) {
  const data = asObject(raw);

  const requirement = (value) => {
    const entry = asObject(value);
    const name = asText(entry.skill, 120);
    if (!name) return null;
    return { skill: name, why: asText(entry.why, 400) };
  };

  return {
    roleTitle: asText(data.roleTitle, 160),
    seniority: asText(data.seniority, 80),
    mustHave: asArray(data.mustHave).map(requirement).filter(Boolean).slice(0, 15),
    niceToHave: asArray(data.niceToHave).map(requirement).filter(Boolean).slice(0, 15),
    responsibilities: asList(data.responsibilities, 15, 300),
    keywords: asList(data.keywords, 25, 80),
    softSkills: asList(data.softSkills, 12, 80),
  };
}

/** The report stored on ResumeAnalysis.analysis. */
export function normalizeAnalysis(raw) {
  const data = asObject(raw);
  const ats = asObject(data.atsAnalysis);
  const verdict = asObject(data.finalVerdict);

  const analysis = {
    overallScore: asNumber(data.overallScore),
    jobMatchScore: asNumber(data.jobMatchScore),
    technicalScore: asNumber(data.technicalScore),
    projectScore: asNumber(data.projectScore),
    presentationScore: asNumber(data.presentationScore),

    summary: asMultiline(data.summary, 2500),
    strengths: findings(data.strengths, 8),
    shortcomings: findings(data.shortcomings, 8),
    missingSkills: skills(data.missingSkills, 15).map(({ name, importance, reason }) => ({
      name,
      importance,
      reason,
    })),
    skillsAnalysis: skills(data.skillsAnalysis, 20),
    requirementMatches: asArray(data.requirementMatches)
      .map((item) => {
        const entry = asObject(item);
        const requirement = asText(entry.requirement, 200);
        if (!requirement) return null;
        return {
          requirement,
          status: asChoice(entry.status, MATCH_STATUSES, 'Not Demonstrated'),
          evidence: asText(entry.evidence, 700),
          gap: asText(entry.gap, 700),
        };
      })
      .filter(Boolean)
      .slice(0, 20),
    projectAnalysis: findings(data.projectAnalysis, 6),
    atsAnalysis: {
      score: asNumber(ats.score),
      issues: asList(ats.issues, 10, 400),
      suggestions: asList(ats.suggestions, 10, 400),
    },
    improvements: findings(data.improvements, 8),
    finalVerdict: {
      summary: asMultiline(verdict.summary, 2000),
      competitiveAdvantages: asList(verdict.competitiveAdvantages, 8, 300),
      concerns: asList(verdict.concerns, 8, 300),
      priorityActions: asList(verdict.priorityActions, 8, 300),
    },
  };

  const hasContent =
    analysis.summary ||
    analysis.strengths.length ||
    analysis.shortcomings.length ||
    analysis.skillsAnalysis.length;

  if (!hasContent) fail(EMPTY_REPORT);

  return analysis;
}

/** The preparation roadmap payload. */
export function normalizeRoadmap(raw) {
  const data = asObject(raw);

  const topics = asArray(data.topics)
    .map((item) => {
      const entry = asObject(item);
      const title = asText(entry.title, 200);
      if (!title) return null;

      return {
        title,
        category: asText(entry.category, 80),
        priority: asChoice(entry.priority, TOPIC_PRIORITIES, 'Important'),
        difficulty: asChoice(entry.difficulty, DIFFICULTIES, 'Intermediate'),
        phase: asNumber(entry.phase, { min: 1, max: 5 }) ?? 1,
        whyItMatters: asMultiline(entry.whyItMatters, 1200),
        resumeConnection: asMultiline(entry.resumeConnection, 900),
        jobConnection: asMultiline(entry.jobConnection, 900),
        whatToLearn: asList(entry.whatToLearn, 6, 240),
        concepts: asList(entry.concepts, 8, 120),
        practical: asList(entry.practical, 5, 300),
        interviewQuestions: asList(entry.interviewQuestions, 6, 300),
        expectedOutcome: asMultiline(entry.expectedOutcome, 900),
        estimatedMinutes: asNumber(entry.estimatedMinutes, { min: 5, max: 600 }) ?? 60,
        completed: asBool(entry.completed),
        completedAt: null,
      };
    })
    .filter(Boolean)
    .slice(0, 16);

  if (!topics.length) fail(EMPTY_REPORT);

  const phases = asArray(data.phases)
    .map((item) => {
      const entry = asObject(item);
      const title = asText(entry.title, 160);
      if (!title) return null;
      return {
        number: asNumber(entry.number, { min: 1, max: 5 }) ?? 1,
        title,
        description: asMultiline(entry.description, 900),
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  const totalMinutes = topics.reduce((sum, topic) => sum + topic.estimatedMinutes, 0);

  return {
    overview: asMultiline(data.overview, 2500),
    focusAreas: asList(data.focusAreas, 8, 120),
    totalMinutes,
    phases,
    topics,
  };
}
