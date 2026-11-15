import { formatImagePrice, formatPerMillion } from './aiUsage.js';

// The types an admin can store a model under. Model ids themselves always come
// from the database, never from this file.
export const MODEL_TYPES = [
  { value: 'text', label: 'Text', icon: 'bx-text', hint: 'Articles and other written output.' },
  { value: 'image', label: 'Image', icon: 'bx-image-alt', hint: 'Article images and the image studio.' },
  { value: 'video', label: 'Video', icon: 'bx-video', hint: 'Reserved for video generation.' },
  { value: 'audio', label: 'Audio', icon: 'bx-microphone', hint: 'Reserved for audio generation.' },
  { value: 'embedding', label: 'Embedding', icon: 'bx-layer', hint: 'Vector embeddings for search and similarity.' },
  { value: 'rerank', label: 'Rerank', icon: 'bx-list-ol', hint: 'Reorders search results by relevance.' },
];

export function modelType(value) {
  return MODEL_TYPES.find((type) => type.value === value) || MODEL_TYPES[0];
}

export function modelPriceLabel(model) {
  if (!model) return '—';

  if (model.type === 'image') {
    if (model.pricePerImage != null) return formatImagePrice(model.pricePerImage);
    return model.pricePerMegapixel == null
      ? 'price not set'
      : `$${Number(model.pricePerMegapixel).toFixed(4)}/MP`;
  }

  if (model.type === 'video') {
    return model.pricePerSecond == null ? 'price not set' : `$${Number(model.pricePerSecond).toFixed(3)}/sec`;
  }

  if (model.type === 'audio' && model.pricePerMillionCharacters != null) {
    return `$${Number(model.pricePerMillionCharacters).toFixed(2)}/M characters`;
  }

  if (['embedding', 'rerank'].includes(model.type)) {
    return model.pricePerMillionInput == null
      ? 'price not set'
      : `${formatPerMillion(model.pricePerMillionInput)} input`;
  }

  if (model.pricePerMillionInput == null && model.pricePerMillionOutput == null) {
    return 'price not set';
  }

  // Embedding models are usually billed on input only.
  if (model.pricePerMillionOutput == null) {
    return `${formatPerMillion(model.pricePerMillionInput)} in`;
  }

  return `${formatPerMillion(model.pricePerMillionInput)} in · ${formatPerMillion(model.pricePerMillionOutput)} out`;
}
