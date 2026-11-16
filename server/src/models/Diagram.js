
import mongoose from 'mongoose';

export const DIAGRAM_DIRECTIONS = [
  'RIGHT',
  'LEFT',
  'DOWN',
  'UP',
];

export const DIAGRAM_EDGE_TYPES = [
  'sync',
  'async',
  'event',
  'data',
  'dependency',
];

const DiagramNodeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },

    group: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const DiagramEdgeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },

    target: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },

    type: {
      type: String,
      enum: DIAGRAM_EDGE_TYPES,
      default: 'sync',
    },
  },
  { _id: false }
);

const DiagramGroupSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    nodeIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const DiagramSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Displayed below the generated image by the reader. It is deliberately
    // stored outside the image so the caption stays editable and selectable.
    caption: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },

    direction: {
      type: String,
      enum: DIAGRAM_DIRECTIONS,
      default: 'RIGHT',
    },

    nodes: {
      type: [DiagramNodeSchema],
      required: true,
      validate: {
        validator: (nodes) => nodes.length > 0,
        message: 'A diagram must contain at least one node.',
      },
    },

    edges: {
      type: [DiagramEdgeSchema],
      default: [],
    },

    groups: {
      type: [DiagramGroupSchema],
      default: [],
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    autoIndex: false,
    autoCreate: false,
  }
);

DiagramSchema.index(
  { article: 1, order: 1 },
  { name: 'article_diagrams' }
);

DiagramSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

DiagramSchema.set('toObject', {
  virtuals: true,
});

const { model, models } = mongoose;

export default models.Diagram || model('Diagram', DiagramSchema);
