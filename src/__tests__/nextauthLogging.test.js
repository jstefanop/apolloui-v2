import fs from 'fs';
import path from 'path';

// The API's JWT is the key to the whole device, and this route's stdout is the
// apollo-ui-v2 journal. Next-auth callbacks receive the session, the token and
// the credentials, so a console.log of their arguments writes all of them there
// (it did: hundreds of lines of JWT per day). NextAuth's own `debug` flag does
// the same.
// Kept outside pages/: a test file under pages/ is built as a route.
const dir = path.join(__dirname, '..', 'pages', 'api', 'auth');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));

describe.each(files)('pages/api/auth/%s', (file) => {
  const source = fs.readFileSync(path.join(dir, file), 'utf8');

  it('does not enable next-auth debug logging', () => {
    expect(source).not.toMatch(/debug\s*:\s*true/);
  });

  it('logs no session, token, credentials or user object', () => {
    const calls = source.match(/console\.[a-z]+\([^;]*\);/g) || [];
    expect(calls.length).toBeGreaterThan(0); // the check is looking at something
    for (const call of calls) {
      expect(call).not.toMatch(
        /\b(session|token|jwt|user|account|profile|credentials|accessToken|password|authData|result)\b/i
      );
    }
  });
});
