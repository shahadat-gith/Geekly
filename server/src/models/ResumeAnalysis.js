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
    format: { type: String, enum: ['pdf', 'docx'], default: 'pdf' },
    pages: { type: Number, default: 0, min: 0 },
    words: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Reusable schemas
const findingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    evidence: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    suggestion: { type: String, default: '' },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['Strong', 'Good', 'Partial', 'Missing'],
      default: 'Missing',
    },
    importance: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    evidence: { type: String, default: '' },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

// One job-description requirement, matched against the resume.
const requirementMatchSchema = new mongoose.Schema(
  {
    requirement: { type: String, required: true },
    status: {
      type: String,
      enum: ['Strong', 'Partial', 'Not Demonstrated'],
      default: 'Not Demonstrated',
    },
    evidence: { type: String, default: '' },
    gap: { type: String, default: '' },
  },
  { _id: false }
);

// Complete AI analysis report
const analysisSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 100 },
    jobMatchScore: { type: Number, min: 0, max: 100 },
    technicalScore: { type: Number, min: 0, max: 100 },
    projectScore: { type: Number, min: 0, max: 100 },
    presentationScore: { type: Number, min: 0, max: 100 },

    summary: { type: String, default: '' },

    strengths: {
      type: [findingSchema],
      default: [],
    },

    shortcomings: {
      type: [findingSchema],
      default: [],
    },

    missingSkills: {
      type: [skillSchema],
      default: [],
    },

    skillsAnalysis: {
      type: [skillSchema],
      default: [],
    },

    requirementMatches: {
      type: [requirementMatchSchema],
      default: [],
    },

    projectAnalysis: {
      type: [findingSchema],
      default: [],
    },

    atsAnalysis: {
      score: { type: Number, min: 0, max: 100 },
      issues: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
    },

    improvements: {
      type: [findingSchema],
      default: [],
    },

    finalVerdict: {
      summary: { type: String, default: '' },
      competitiveAdvantages: { type: [String], default: [] },
      concerns: { type: [String], default: [] },
      priorityActions: { type: [String], default: [] },
    },
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
