import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Select,
  Skeleton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { MdWifi, MdWifiOff } from 'react-icons/md';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import SignalBars from './SignalBars';
import WifiPasswordModal from './WifiPasswordModal';
import WifiConfirmDialog from './WifiConfirmDialog';
import {
  WIFI_CONNECT_MUTATION,
  WIFI_DISCONNECT_MUTATION,
  WIFI_FORGET_MUTATION,
  WIFI_INTERFACES_QUERY,
  WIFI_NETWORKS_QUERY,
  WIFI_SAVED_QUERY,
  WIFI_STATUS_QUERY,
} from '../../graphql/wifi';
import { sendFeedback } from '../../redux/slices/feedbackSlice';

// Everything here is keyed by SSID, never by position in the list: the previous
// panel tracked the selected network by array index, and a rescan reorders the
// list constantly.
const WifiPanel = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const rowBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const subtle = useColorModeValue('gray.600', 'gray.400');
  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const thumbBg = useColorModeValue('gray.300', 'whiteAlpha.300');
  const thumbHoverBg = useColorModeValue('gray.400', 'whiteAlpha.400');

  const [ifname, setIfname] = useState(null);
  const [pending, setPending] = useState(null); // ssid being joined
  const [modal, setModal] = useState(null); // network awaiting a passphrase
  const [modalError, setModalError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  // Which band to pin, per SSID. NetworkManager picks 5 GHz when both are on
  // offer, and the built-in radio of an Apollo II cannot hold it — so a network
  // seen on both bands lets the user say which one.
  const [bandChoice, setBandChoice] = useState({});
  // Scanning is a deliberate act, not something the page does on arrival: it
  // wakes the radio and takes seconds, and most visits here are to check what
  // the device is connected to, which the card above already answers.
  const [scanned, setScanned] = useState(false);

  const { data: ifData, loading: ifLoading, refetch: refetchInterfaces } =
    useQuery(WIFI_INTERFACES_QUERY, { fetchPolicy: 'no-cache' });

  const interfaces = ifData?.Mcu?.wifiInterfaces?.result?.interfaces || [];
  const preferred = ifData?.Mcu?.wifiInterfaces?.result?.preferred || null;
  const selected = ifname || preferred || interfaces[0]?.device || null;

  const { data: statusData, refetch: refetchStatus } = useQuery(WIFI_STATUS_QUERY, {
    variables: { ifname: selected },
    skip: !selected,
    fetchPolicy: 'no-cache',
  });
  const status = statusData?.Mcu?.wifiStatus?.result || null;

  const { data: savedData, refetch: refetchSaved } = useQuery(WIFI_SAVED_QUERY, {
    fetchPolicy: 'no-cache',
  });
  // Memoized: the `|| []` builds a new array on every render, which would make
  // the lookup below rebuild each time too.
  const saved = useMemo(
    () => savedData?.Mcu?.wifiSaved?.result?.networks || [],
    [savedData]
  );

  const [scan, { data: scanData, loading: scanning }] = useLazyQuery(WIFI_NETWORKS_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const networks = scanData?.Mcu?.wifiNetworks?.result?.networks || [];

  const [connect] = useMutation(WIFI_CONNECT_MUTATION);
  const [disconnect] = useMutation(WIFI_DISCONNECT_MUTATION);
  const [forget] = useMutation(WIFI_FORGET_MUTATION);

  const refresh = useCallback(() => {
    if (!selected) return;
    setScanned(true);
    scan({ variables: { ifname: selected } });
  }, [scan, selected]);

  // Changing adapter invalidates the list: each radio sees its own set.
  useEffect(() => {
    setScanned(false);
  }, [selected]);

  // A network is "saved" when a stored profile carries the same name. The list
  // shows it so Connect can skip asking for a passphrase we already hold.
  const savedNames = useMemo(() => new Set(saved.map((s) => s.name)), [saved]);

  const reasonText = (code) =>
    intl.formatMessage({
      id: `wifi.error.${code}`,
      defaultMessage: intl.formatMessage({ id: 'wifi.error.failed' }),
    });

  const afterChange = async () => {
    await Promise.all([refetchStatus(), refetchSaved(), refetchInterfaces()]);
    if (scanned) refresh();
  };

  const doConnect = async (network, { passphrase = null, hidden = false } = {}) => {
    const band = bandChoice[network.ssid] || null;
    setPending(network.ssid);
    setModalError(null);
    const { data, errors } = await connect({
      variables: {
        input: { ssid: network.ssid, passphrase, ifname: selected, hidden, band },
      },
    });
    const err = errors?.[0]?.message || data?.Mcu?.wifiConnect?.error?.message;
    setPending(null);
    if (err) {
      const text = reasonText(err);
      // Keep the dialog open on a bad key so the passphrase can be retyped
      // without hunting for the network again.
      if (modal) setModalError(text);
      else dispatch(sendFeedback({ message: text, type: 'error' }));
      return;
    }
    setModal(null);
    dispatch(
      sendFeedback({
        message: intl.formatMessage({ id: 'wifi.toast.connected' }, { ssid: network.ssid }),
        type: 'success',
      })
    );
    await afterChange();
  };

  // Open networks are joined straight away: asking for a passphrase that does
  // not exist is what made them unreachable before.
  const onConnectClick = (network) => {
    if (network.open) return doConnect(network);
    if (savedNames.has(network.ssid)) return doConnect(network);
    setModal({ ...network, saved: savedNames.has(network.ssid) });
  };

  const onDisconnect = () => {
    const iface = interfaces.find((i) => i.device === selected);
    setConfirm({
      kind: 'disconnect',
      ssid: status?.ssid,
      // The warning that matters: dropping the radio that is serving this very
      // page takes the device off the network you are administering it from.
      selfLockout: !!iface?.carriesDefaultRoute,
      run: async () => {
        const { data, errors } = await disconnect({ variables: { ifname: selected } });
        const err = errors?.[0]?.message || data?.Mcu?.wifiDisconnect?.error?.message;
        if (err) dispatch(sendFeedback({ message: reasonText(err), type: 'error' }));
        await afterChange();
      },
    });
  };

  const onForget = (profile) => {
    setConfirm({
      kind: 'forget',
      ssid: profile.name,
      selfLockout: profile.active && interfaces.find((i) => i.device === selected)?.carriesDefaultRoute,
      run: async () => {
        const { data, errors } = await forget({ variables: { uuid: profile.uuid } });
        const err = errors?.[0]?.message || data?.Mcu?.wifiForget?.error?.message;
        if (err) dispatch(sendFeedback({ message: reasonText(err), type: 'error' }));
        await afterChange();
      },
    });
  };

  const kindBadge = (kind) =>
    kind === 'usb' || kind === 'builtin' ? (
      <Badge ml="2" fontSize="0.65em" colorScheme={kind === 'usb' ? 'purple' : 'gray'}>
        {intl.formatMessage({ id: `wifi.adapter.${kind}` })}
      </Badge>
    ) : null;

  // PanelCard gives its children no horizontal padding — each section supplies
  // its own, matching the 22px of the card header.
  const PAD = { px: '22px', pb: '18px', pt: '6px' };

  if (ifLoading)
    return (
      <Box {...PAD}>
        <Skeleton height="120px" borderRadius="12px" />
      </Box>
    );

  if (!interfaces.length) {
    return (
      <Flex align="center" gap={2} {...PAD} color={subtle}>
        <Icon as={MdWifiOff} />
        <Text fontSize="sm">{intl.formatMessage({ id: 'wifi.noAdapter' })}</Text>
      </Flex>
    );
  }

  return (
    <Box {...PAD}>
      {/* The picker appears only when there IS a choice. Most devices have one
          radio, and offering a menu of one is noise. */}
      {interfaces.length > 1 && (
        <Flex align="center" gap={3} mb={4}>
          <Text fontSize="sm" color={subtle}>
            {intl.formatMessage({ id: 'wifi.adapter.label' })}
          </Text>
          <Select
            size="sm"
            maxW="320px"
            value={selected || ''}
            onChange={(e) => setIfname(e.target.value)}
          >
            {interfaces.map((i) => (
              <option key={i.device} value={i.device}>
                {i.device}
                {i.kind !== 'unknown' ? ` — ${intl.formatMessage({ id: `wifi.adapter.${i.kind}` })}` : ''}
                {i.connection ? ` · ${i.connection}` : ''}
              </option>
            ))}
          </Select>
        </Flex>
      )}

      {/* What the user actually wants to know first: am I connected, to what. */}
      <Card bg={rowBg} p="16px" mb="20px" borderRadius="12px">
        <Flex justify="space-between" align="center" gap={3} wrap="wrap">
          <Flex align="center" gap={3}>
            <Icon as={status?.connected ? MdWifi : MdWifiOff} w="20px" h="20px" />
            <Box>
              <Text fontWeight="700">
                {status?.connected
                  ? intl.formatMessage({ id: 'wifi.connectedTo' }, { ssid: status.ssid })
                  : intl.formatMessage({ id: 'wifi.notConnected' })}
              </Text>
              <Text fontSize="sm" color={subtle}>
                {[
                  status?.ipAddress,
                  status?.interface,
                  // Which band the link is really on — the point of being able
                  // to choose one.
                  status?.band && intl.formatMessage({ id: 'wifi.band' }, { band: status.band }),
                ]
                  .filter(Boolean)
                  .join(' · ') || intl.formatMessage({ id: 'wifi.notConnected.hint' })}
                {kindBadge(status?.kind)}
              </Text>
            </Box>
          </Flex>
          {status?.connected && (
            <Button size="sm" variant="outline" colorScheme="red" onClick={onDisconnect}>
              {intl.formatMessage({ id: 'wifi.action.disconnect' })}
            </Button>
          )}
        </Flex>
      </Card>

      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="600">{intl.formatMessage({ id: 'wifi.available' })}</Text>
        {scanned && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RepeatIcon />}
            onClick={refresh}
            isLoading={scanning}
          >
            {intl.formatMessage({ id: 'wifi.action.refresh' })}
          </Button>
        )}
      </Flex>

      {!scanned ? (
        <Flex direction="column" align="center" gap={2} py={5}>
          <Button size="sm" leftIcon={<RepeatIcon />} onClick={refresh} isLoading={scanning}>
            {intl.formatMessage({ id: 'wifi.action.scan' })}
          </Button>
          <Text fontSize="xs" color={subtle}>
            {intl.formatMessage({ id: 'wifi.scan.hint' })}
          </Text>
        </Flex>
      ) : scanning && !networks.length ? (
        <Flex direction="column" gap={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height="44px" borderRadius="10px" />
          ))}
        </Flex>
      ) : (
        <Box
          // Past a handful the list would push everything below it off screen;
          // the panel keeps its height and the list scrolls inside.
          maxH={networks.length > 5 ? '260px' : undefined}
          overflowY={networks.length > 5 ? 'auto' : undefined}
          pr={networks.length > 5 ? '6px' : undefined}
          css={
            networks.length > 5
              ? {
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-track': { background: trackBg, borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb': {
                    background: thumbBg,
                    borderRadius: '4px',
                    '&:hover': { background: thumbHoverBg },
                  },
                }
              : undefined
          }
        >
          <Flex direction="column" gap={2}>
            {networks.map((n) => {
              // Key by identity, never by index: the list reorders on every scan.
              const key = n.hidden ? `hidden-${n.channel}-${n.signal}` : n.ssid;
              const isCurrent = status?.connected && status.ssid === n.ssid;
              return (
                <Flex
                  key={key}
                  align="center"
                  gap={3}
                  bg={rowBg}
                  px="12px"
                  py="10px"
                  borderRadius="10px"
                >
                  <SignalBars signal={n.signal} />
                  <Text flex="1" noOfLines={1} fontSize="sm">
                    {n.hidden ? (
                      <Text as="span" fontStyle="italic" color={subtle}>
                        {intl.formatMessage({ id: 'wifi.network.hidden' })}
                      </Text>
                    ) : (
                      n.ssid
                    )}
                    {/* Which band(s) the name answers on: a router on both shows
                        2.4 + 5, and it is the first thing anyone debugging a weak
                        link wants to know. */}
                    {(n.bands || []).map((b) => (
                      <Badge key={b} ml="2" fontSize="0.65em" colorScheme="blue" variant="subtle">
                        {intl.formatMessage({ id: 'wifi.band' }, { band: b })}
                      </Badge>
                    ))}
                    {n.open && (
                      <Badge ml="2" fontSize="0.65em" colorScheme="orange">
                        {intl.formatMessage({ id: 'wifi.security.open' })}
                      </Badge>
                    )}
                    {savedNames.has(n.ssid) && (
                      <Badge ml="2" fontSize="0.65em" colorScheme="green">
                        {intl.formatMessage({ id: 'wifi.network.saved' })}
                      </Badge>
                    )}
                  </Text>
                  {/* Only where there is a real choice: a network answering on
                      both bands. */}
                  {!n.hidden && (n.bands || []).length > 1 && !isCurrent && (
                    <Select
                      size="xs"
                      w="110px"
                      borderRadius="6px"
                      value={bandChoice[n.ssid] || ''}
                      onChange={(e) =>
                        setBandChoice((b) => ({ ...b, [n.ssid]: e.target.value }))
                      }
                    >
                      <option value="">{intl.formatMessage({ id: 'wifi.band.auto' })}</option>
                      <option value="bg">{intl.formatMessage({ id: 'wifi.band' }, { band: '2.4' })}</option>
                      <option value="a">{intl.formatMessage({ id: 'wifi.band' }, { band: '5' })}</option>
                    </Select>
                  )}
                  {isCurrent ? (
                    <Badge colorScheme="whatsapp">
                      {intl.formatMessage({ id: 'wifi.network.active' })}
                    </Badge>
                  ) : n.hidden ? (
                    // A hidden network cannot be joined from the list: it does not
                    // announce the name, so there is nothing to connect TO. Point
                    // at the entry below rather than offering a dead button.
                    <Text fontSize="xs" color={subtle} whiteSpace="nowrap">
                      {intl.formatMessage({ id: 'wifi.network.hiddenHint' })}
                    </Text>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      // `pending` and a hidden ssid are both null, and null === null
                      // left the spinner running for ever.
                      isLoading={pending != null && pending === n.ssid}
                      isDisabled={pending != null && pending !== n.ssid}
                      onClick={() => onConnectClick(n)}
                    >
                      {intl.formatMessage({ id: 'wifi.action.connect' })}
                    </Button>
                  )}
                </Flex>
              );
            })}
            {!networks.length && !scanning && (
              <Text fontSize="sm" color={subtle} py={2}>
                {intl.formatMessage({ id: 'wifi.noNetworks' })}
              </Text>
            )}
          </Flex>
        </Box>
      )}

      <Button
        mt={3}
        size="sm"
        variant="link"
        onClick={() => setModal({ ssid: '', hidden: true, manual: true, open: false })}
      >
        {intl.formatMessage({ id: 'wifi.action.addHidden' })}
      </Button>

      {saved.length > 0 && (
        <Box mt={6}>
          <Text fontWeight="600" mb={2}>
            {intl.formatMessage({ id: 'wifi.saved' })}
          </Text>
          <Flex direction="column" gap={2}>
            {saved.map((s) => (
              <Flex key={s.uuid} align="center" gap={3} px="12px" py="8px" bg={rowBg} borderRadius="10px">
                <Text flex="1" fontSize="sm" noOfLines={1}>
                  {s.name}
                  {s.active && (
                    <Badge ml="2" fontSize="0.65em" colorScheme="whatsapp">
                      {intl.formatMessage({ id: 'wifi.network.active' })}
                    </Badge>
                  )}
                </Text>
                <Button size="xs" variant="ghost" colorScheme="red" onClick={() => onForget(s)}>
                  {intl.formatMessage({ id: 'wifi.action.forget' })}
                </Button>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}

      <WifiPasswordModal
        isOpen={!!modal}
        network={modal}
        isConnecting={!!pending}
        error={modalError}
        onClose={() => {
          setModal(null);
          setModalError(null);
        }}
        onSubmit={({ ssid, passphrase, hidden }) => {
          // A hidden network is named in the dialog, since nothing in the list
          // carries its name.
          const target = modal.manual ? { ssid, hidden: true, open: false } : modal;
          doConnect(target, { passphrase, hidden });
        }}
      />

      <WifiConfirmDialog
        request={confirm}
        onClose={() => setConfirm(null)}
      />
    </Box>
  );
};

export default WifiPanel;
