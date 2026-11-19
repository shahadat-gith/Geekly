import axios from 'axios';
import { load } from 'cheerio';

async function readReference(url) {
  const parsedUrl = new URL(url);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS references are supported');
  }

  const response = await axios.get(parsedUrl.href, {
    timeout: 12_000,
    maxRedirects: 5,
    responseType: 'text',
    headers: {
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
      'User-Agent': 'GeeklyAdmin/1.0 (+article research)',
    },
  });

  const $ = load(response.data);
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').first().text() ||
    parsedUrl.hostname;

  $('script, style, noscript, svg, nav, footer, header, aside, form, iframe').remove();
  const article = $('article').first();
  const main = $('main').first();
  const content = article.length ? article : main.length ? main : $('body');

  // Keep document structure visible to the writer. Flattening all whitespace
  // makes a long tutorial read like one undifferentiated summary prompt.
  content.find('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const level = Number(element.tagName.slice(1));
    $(element).prepend(`\n${'#'.repeat(level)} `);
  });
  content.find('p, li, blockquote, pre').each((_, element) => {
    $(element).prepend('\n');
  });
  content.find('br').replaceWith('\n');

  const text = content.text()
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) throw new Error('No readable article text was found');
  return {
    url: response.request?.res?.responseUrl || parsedUrl.href,
    title: title.trim().slice(0, 160),
    text,
  };
}

// A reference is optional. A failed fetch is reported as a warning so the
// article can still be generated from the topic and model knowledge.
export async function fetchReference(value) {
  const url = String(value ?? '').trim();
  if (!url) return { reference: null, warning: '' };

  try {
    return { reference: await readReference(url), warning: '' };
  } catch (error) {
    const reason = error.response?.status
      ? `HTTP ${error.response.status}`
      : error.message || 'could not be read';
    return { reference: null, warning: `${url} — ${reason}.` };
  }
}
