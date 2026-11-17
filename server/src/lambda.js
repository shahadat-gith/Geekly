import serverlessHttp from 'serverless-http';
import app from './app.js';
import { connectToDB } from './config/mongodb.js';

// API Gateway hands every request to this handler, and a warm container reuses
// the same process, so the Mongo connection is opened lazily and reused rather
// than reconnecting per invocation. connectToDB() also caches on globalThis.
const handle = serverlessHttp(app);

let database;

function ready() {
  if (!database) {
    database = connectToDB().catch((error) => {
      // Never cache a rejected promise: the next invocation retries.
      database = undefined;
      throw error;
    });
  }
  return database;
}

// API Gateway's payload format 2.0 forwards cookies from the top-level `cookies`
// array; a Set-Cookie header inside `headers` is not reliable, and several
// cookies get comma-folded into one invalid value. Express sets cookies as a
// normal header, so move them to where the gateway reads them (OAuth state).
function forwardCookies(response, event) {
  if (event.version !== '2.0' || !response?.headers) return response;

  const name = Object.keys(response.headers).find(
    (header) => header.toLowerCase() === 'set-cookie',
  );
  if (!name) return response;

  const value = response.headers[name];
  const headers = { ...response.headers };
  delete headers[name];

  return {
    ...response,
    headers,
    cookies: [...(response.cookies ?? []), ...(Array.isArray(value) ? value : [value])],
  };
}

export const handler = async (event, context) => {
  // Mongoose keeps the Node event loop alive; let the invocation finish as soon
  // as the response has been returned instead of waiting for an idle loop.
  context.callbackWaitsForEmptyEventLoop = false;

  await ready();
  return forwardCookies(await handle(event, context), event);
};
