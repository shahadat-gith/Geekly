
import mongoose from 'mongoose';

export const ARTICLE_STATUSES = ['draft', 'published', 'archived'];

// Article: metadata, stats, and one canonical Tiptap document.
const ArticleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // One article belongs to exactly one topic. A topic can own many articles.
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },

    // Canonical Tiptap/ProseMirror JSON document.
    // Includes article content, annotations, image references,
    // and diagram references.
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    referenceVideos: [
      {
        type: String,
        trim: true,
      },
    ],

    stats: {
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    status: {
      type: String,
      enum: ARTICLE_STATUSES,
      default: 'draft',
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    lastEditedAt: {
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

// Published article feed.
ArticleSchema.index(
  { publishedAt: -1 },
  {
    name: 'feed_published',
    partialFilterExpression: { status: 'published' },
  }
);

// Topic-specific published feed.
ArticleSchema.index(
  { topic: 1, publishedAt: -1 },
  {
    name: 'topic_feed',
    partialFilterExpression: { status: 'published' },
  }
);

// Full-text search covers article metadata.
ArticleSchema.index(
  { title: 'text', subtitle: 'text' },
  {
    name: 'article_text',
    weights: {
      title: 10,
      subtitle: 5,
    },
  }
);

ArticleSchema.virtual('isPublished').get(function () {
  return this.status === 'published' && this.publishedAt != null;
});

// Keep lastEditedAt fresh whenever article content changes.
ArticleSchema.pre('save', function () {
  if (this.isModified('content')) {
    this.lastEditedAt = new Date();
  }
});

// Consistent API shape: id instead of _id.
ArticleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,

  transform(_doc, ret) {
    if (ret._id) {
      ret.id = ret._id.toString();
    }

    delete ret._id;
    return ret;
  },
});

ArticleSchema.set('toObject', {
  virtuals: true,
});

const { model, models } = mongoose;

export default models.Article || model('Article', ArticleSchema);
