import mongoose from 'mongoose';

export const ROADMAP_STATUSES = ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'];
export const TOPIC_PRIORITIES = ['Must Prepare', 'Important', 'Good to Know'];
export const TOPIC_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const phaseSchema = new mongoose.Schema(
  {
    number: { type: Number, default: 1, min: 1, max: 5 },
    title: { type: String, default: '', maxlength: 160 },
    description: { type: String, default: '', maxlength: 900 },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  category: { type: String, default: '', maxlength: 80 },
  priority: { type: String, enum: TOPIC_PRIORITIES, default: 'Important' },
  difficulty: { type: String, enum: TOPIC_DIFFICULTIES, default: 'Intermediate' },
  phase: { type: Number, default: 1, min: 1, max: 5 },

  whyItMatters: { type: String, default: '', maxlength: 1200 },
  resumeConnection: { type: String, default: '', maxlength: 900 },
  jobConnection: { type: String, default: '', maxlength: 900 },

  whatToLearn: { type: [String], default: [] },
  concepts: { type: [String], default: [] },
  practical: { type: [String], default: [] },
  interviewQuestions: { type: [String], default: [] },

  expectedOutcome: { type: String, default: '', maxlength: 900 },
  estimatedMinutes: { type: Number, default: 60, min: 5, max: 3600 },

  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const PreparationRoadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
      required: true,
    },

    status: { type: String, enum: ROADMAP_STATUSES, default: 'QUEUED' },
    overview: { type: String, default: '', maxlength: 2500 },
    focusAreas: { type: [String], default: [] },
    totalMinutes: { type: Number, default: 0, min: 0 },

    phases: { type: [phaseSchema], default: [] },
    topics: { type: [topicSchema], default: [] },

    error: { type: String, default: '', maxlength: 500 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

// One roadmap per analysis: asking twice returns the existing plan.
PreparationRoadmapSchema.index({ analysis: 1 }, { name: 'roadmap_analysis', unique: true });
PreparationRoadmapSchema.index({ user: 1, createdAt: -1 }, { name: 'roadmap_history' });

PreparationRoadmapSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.PreparationRoadmap || model('PreparationRoadmap', PreparationRoadmapSchema);
