import axios from 'axios';
import { load } from 'cheerio';

const MAX_TEXT_LENGTH = 12_000;

async function readReference(url) {
  const parsedUrl = new URL(url);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS references are supported');
  }

  const response = await axios.get(parsedUrl.href, {
    timeout: 12_000,
    maxContentLength: 3_000_000,
    maxBodyLength: 3_000_000,
    maxRedirects: 5,
    responseType: 'text',
    headers: {
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
      'User-Agent': 'NoobEngineerAdmin/1.0 (+article research)',
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
  const content = article.length ? article.text() : main.length ? main.text() : $('body').text();
  const text = content.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);

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
