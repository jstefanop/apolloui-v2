import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { mcuSelector } from '../../redux/reselect/mcu';
import { minerSelector } from '../../redux/reselect/miner';
import { nodeSelector } from '../../redux/reselect/node';

// One place for every page's browser-tab title, rendered from _app so no page
// has to remember its own. pathname -> i18n key; the hostname is prefixed, and a
// few pages carry a live suffix (miner/overview hashrate, node block height).
//
// Hostname distinguishes device TYPES, not individual units (it is baked per
// image: every Solo Node reads "FutureBit-Solo-Node"). A user-settable device
// name is the follow-up for real per-unit uniqueness — pending John's sign-off.
const PAGE_KEY = {
  '/overview': 'page_title.overview',
  '/miner': 'page_title.miner',
  '/node': 'page_title.node',
  '/system': 'page_title.system',
  '/settings': 'page_title.settings',
  '/settings/[tab]': 'page_title.settings',
  '/solo-mining': 'page_title.solo_mining',
  '/apps': 'page_title.apps',
  '/signout': 'page_title.signout',
  '/signin': 'page_title.signin',
  '/setup': 'page_title.setup',
  '/404': 'page_title.not_found',
};

const DocumentTitle = () => {
  const intl = useIntl();
  const router = useRouter();
  // Hooks must run unconditionally; the per-route logic below picks what to use.
  const hostname = useSelector((s) => mcuSelector(s).data?.hostname);
  const hashrate = useSelector((s) => minerSelector(s).data?.stats?.globalHashrate);
  const node = useSelector((s) => nodeSelector(s).data);

  const key = PAGE_KEY[router.pathname] || 'page_title.default';
  let page = intl.formatMessage({ id: key });

  // Settings also says which tab you are on — reuse the tabs' own localized names.
  if (router.pathname === '/settings/[tab]' && router.query.tab) {
    const tab = intl.formatMessage({
      id: `settings.tabs.${router.query.tab}`,
      defaultMessage: String(router.query.tab),
    });
    page = `${page} · ${tab}`;
  }

  // Live hashrate where it is useful, only while the miner is actually producing.
  if (
    (router.pathname === '/overview' || router.pathname === '/miner') &&
    hashrate?.value
  ) {
    page = `${page} · ${hashrate.value} ${hashrate.unit}`;
  }

  // Node: block height when synced, "syncing" while catching up.
  if (router.pathname === '/node' && node) {
    if (node.blockHeader > node.blocksCount) {
      page = `${page} · ${intl.formatMessage({ id: 'page_title.node_syncing' })}`;
    } else if (node.blocksCount > 0) {
      page = `${page} · ${node.blocksCount}`;
    }
  }

  // Hostname first: tabs truncate on the right, and it is the distinguishing
  // part. No hostname yet (before the mcu push, or on signin/setup/404 where
  // there is no device data) falls back to the page name alone.
  const title = hostname ? `${hostname} · ${page}` : page;

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

export default DocumentTitle;
