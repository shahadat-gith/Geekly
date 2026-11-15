// Prompts live in one file per domain. Add a new file (image.js, chat.js, …)
// and re-export it here so callers never reach into a prompt file directly.
export { ARTICLE_SYSTEM_PROMPT, buildArticlePrompt } from './article.js';
