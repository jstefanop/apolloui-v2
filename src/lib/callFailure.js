// Did a GraphQL call fail? One answer for every save path.
//
// The client runs with errorPolicy 'all', so a failed call does not reject: a
// GraphQL error comes back in `errors` with `data` null (or `error`, when the
// hook wraps it), and a transport failure may come back as an ApolloError in
// either field. The resolvers add a third shape — `data.<Domain>.<op>.error`,
// a refusal written for the user. Reading only the last of these reported
// success, and went on to restart the miner, for a save that never happened.
//
// Returns the message to show, or null when the call went through.

const messageOf = (e) => {
  if (!e) return null;
  if (Array.isArray(e)) return e.map(messageOf).find(Boolean) || null;
  return e.message || String(e);
};

// `data.<Domain>.<op>.error`, wherever the operation sits in the response.
const payloadError = (data) => {
  if (!data || typeof data !== 'object') return null;
  for (const domain of Object.values(data)) {
    if (!domain || typeof domain !== 'object') continue;
    for (const op of Object.values(domain)) {
      if (op && typeof op === 'object' && op.error) return messageOf(op.error);
    }
  }
  return null;
};

export const callFailure = (result) => {
  if (!result) return 'No response from the device';
  const message =
    messageOf(result.errors) || messageOf(result.error) || payloadError(result.data);
  if (message) return message;
  // Nothing wrong reported, but nothing came back either: not a success.
  if (result.data == null) return 'No response from the device';
  return null;
};

// Runs save steps in order and stops at the first that failed, so nothing after
// a failed step — the next write, a restart, a "saved" message — happens.
export const runSteps = async (steps) => {
  for (const { name, run } of steps) {
    let result;
    try {
      result = await run();
    } catch (error) {
      return { ok: false, step: name, message: error.message || String(error) };
    }
    const message = callFailure(result);
    if (message) return { ok: false, step: name, message };
  }
  return { ok: true };
};
