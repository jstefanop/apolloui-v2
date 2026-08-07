// Keeping the pools the user asked to keep, as part of saving settings.
//
// This sits between two features that were built on separate branches and only
// met when both landed: saving pool profiles, and restarting services according
// to what the node's storage allows. They share one handler, and the failure
// that costs most is not either of them being wrong on its own — it is one
// silently swallowing the other. The settings are already applied by the time
// this runs; the restarts are what still has to happen after it.
//
// So this never throws. It returns the messages to show, and the caller carries
// on to the restarts whatever happened here.

export const savePendingPools = async ({
  pending,
  settings,
  offered,
  profiles = [],
  save,
  suggestName,
  onSaved,
  onFailed,
}) => {
  const feedback = [];

  try {
    for (const [which, pool] of [
      ['primary', settings?.pool],
      ['backup', settings?.backupPool],
    ]) {
      const request = pending?.[which];

      // The same gate the control is rendered behind, not just the toggle it
      // left behind: withdrawing the edit hides the control but keeps the flag,
      // and that alone was enough to keep a pool the user had dropped. Solo
      // mining rewrites the pool to the local ckpool, which must never be kept.
      if (
        !offered?.[which] ||
        settings?.nodeEnableSoloMining ||
        !request?.enabled ||
        !pool?.url
      )
        continue;

      const kept = await save({
        name: request.name?.trim() || suggestName(pool.url, profiles),
        url: pool.url,
        username: pool.username || null,
        password: pool.password || null,
      });

      feedback.push(
        kept?.ok ? onSaved(kept.profile) : onFailed(kept?.message)
      );
    }
  } catch (error) {
    feedback.push(onFailed(error.toString()));
  }

  // Errors last: feedback shows one message at a time, so a failure has to be
  // dispatched after the successes rather than under them.
  return [...feedback].sort(
    (a, b) => (a.type === 'error' ? 1 : 0) - (b.type === 'error' ? 1 : 0)
  );
};

export default savePendingPools;
