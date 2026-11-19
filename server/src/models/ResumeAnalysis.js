import mongoose from 'mongoose';

// Company information
const companyDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

// The upload is discarded after text extraction; only these measurements stay.
const documentSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: '', maxlength: 255 },
    format: { type: String, enum: ['pdf', 'docx', 'text'], default: 'pdf' },
    pages: { type: Number, default: 0, min: 0 },
    words: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// One change the candidate can paste into the resume.
const editSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    section: {
      type: String,
      enum: ['Summary', 'Experience', 'Projects', 'Skills', 'Education', 'Other'],
      default: 'Other',
    },
    target: { type: String, default: '' },
    action: {
      type: String,
      enum: ['Rewrite', 'Add', 'Quantify', 'Remove', 'Reorder'],
      default: 'Rewrite',
    },
    before: { type: String, default: '' },
    after: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

// Only version-2 reports carry this; the review no longer produces it.
const formattingSchema = new mongoose.Schema(
  {
    issue: { type: String, required: true },
    fix: { type: String, default: '' },
  },
  { _id: false }
);

// A labelled point: a strong point.
const pointSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { _id: false }
);

// A skill the posting asks for and the resume does not show.
const missingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    priority: { type: String, enum: ['Must', 'Nice'], default: 'Must' },
    detail: { type: String, default: '' },
  },
  { _id: false }
);

// A weak point, with how much it hurts this application.
const gapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  { _id: false }
);

// The review report. Older stored reports have version 0 and none of these
// fields, which is how the client recognises a report from the previous format.
const analysisSchema = new mongoose.Schema(
  {
    version: { type: Number, default: 0 },

    summary: { type: String, default: '' },

    strengths: { type: [pointSchema], default: [] },
    gaps: { type: [gapSchema], default: [] },
    missingSkills: { type: [missingSkillSchema], default: [] },
    edits: { type: [editSchema], default: [] },
    formatting: { type: [formattingSchema], default: [] },
  },
  { _id: false }
);

// Main model
const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    resumeText: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    companyDetails: {
      type: companyDetailsSchema,
      default: () => ({}),
    },

    customInstructions: {
      type: String,
      default: '',
    },

    document: {
      type: documentSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'QUEUED',
      index: true,
    },

    // Short, user-facing description of the step in progress.
    stage: {
      type: String,
      default: '',
      maxlength: 120,
    },

    analysis: {
      type: analysisSchema,
      default: null,
    },

    error: {
      type: String,
      default: '',
      maxlength: 500,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    autoIndex: false,
    autoCreate: false,
  }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 }, { name: 'analysis_history' });

resumeAnalysisSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.ResumeAnalysis || model('ResumeAnalysis', resumeAnalysisSchema);
