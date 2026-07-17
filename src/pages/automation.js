import { useEffect, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  GridItem,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery, useLazyQuery, useSubscription } from '@apollo/client';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useIntl } from 'react-intl';
import { settingsSelector } from '../redux/reselect/settings';

import {
  GET_AUTOMATION_QUERY,
  SET_AUTOMATION_CONFIG_QUERY,
  CREATE_AUTOMATION_RULE_QUERY,
  UPDATE_AUTOMATION_RULE_QUERY,
  DELETE_AUTOMATION_RULE_QUERY,
  CLEAR_AUTOMATION_OVERRIDE_QUERY,
  AUTOMATION_SUBSCRIPTION,
} from '../graphql/automation';
import { sendFeedback } from '../redux/slices/feedbackSlice';

import AutomationStatusCard from '../components/automation/AutomationStatusCard';
import CurrentConditionsCard from '../components/automation/CurrentConditionsCard';
import RulesList from '../components/automation/RulesList';
import RuleEditorModal from '../components/automation/RuleEditorModal';
import RuleTemplatesModal from '../components/automation/RuleTemplatesModal';
import GuardRailsCard from '../components/automation/GuardRailsCard';
import TariffCard from '../components/automation/TariffCard';
import MqttInputsCard from '../components/automation/MqttInputsCard';
import EventsTimeline from '../components/automation/EventsTimeline';

const Automation = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  // Temperature is stored in °C; the UI shows/accepts it in the user's unit.
  const { data: settingsData } = useSelector(settingsSelector, shallowEqual);
  const temperatureUnit = settingsData?.temperatureUnit || 'c';

  // Two views under one page: operational (rules & activity) and setup (the
  // configure-once cards). The active tab lives in the URL so it survives a
  // refresh and is linkable.
  const router = useRouter();
  const activeTab = router.query.tab === 'setup' ? 1 : 0;
  const setActiveTab = (index) =>
    router.replace(
      { pathname: '/automation', query: index === 1 ? { tab: 'setup' } : {} },
      undefined,
      { shallow: true }
    );
  const hintColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const tabSelected = { color: 'brand.400', borderColor: 'brand.400' };

  const [editorOpen, setEditorOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  // How many history events to pull from the backend ring buffer (grows on "Load
  // more"). The backend keeps up to 500.
  const [eventsLimit, setEventsLimit] = useState(30);
  const EVENTS_MAX = 500;

  const { data: liveData, previousData, loading, refetch } = useQuery(GET_AUTOMATION_QUERY, {
    fetchPolicy: 'network-only',
    variables: { eventsLimit },
  });
  // "Load more" bumps eventsLimit, which re-runs this network-only query and
  // clears `data` while it loads — falling back to previousData keeps the page
  // mounted (and scroll position) instead of swapping in the full-page spinner
  // for an incremental append.
  const data = liveData ?? previousData;

  // Merge the DB history with what's on screen on every (re)fetch — a union by id,
  // newest first. Replacing would race the subscription: a refetch triggered by a
  // save could wipe an event the subscription just appended.
  useEffect(() => {
    const queryEvents = data?.Automation?.events?.result;
    if (!queryEvents) return;
    setLiveEvents((prev) => {
      const byId = new Map();
      [...prev, ...queryEvents].forEach((e) => byId.set(e.id, e));
      return [...byId.values()].sort((a, b) => b.id - a.id).slice(0, EVENTS_MAX);
    });
  }, [data]);

  // The scheduler pushes a fresh decision every tick, so the page reflects what
  // the engine is thinking without polling it — and carries the freshly recorded
  // event, if any, so the history updates the moment the engine acts.
  useSubscription(AUTOMATION_SUBSCRIPTION, {
    onData: ({ data: pushed }) => {
      const result = pushed?.data?.automation?.result;
      if (!result) return;
      setLiveState(result);
      if (result.event) {
        setLiveEvents((prev) =>
          prev.some((e) => e.id === result.event.id) ? prev : [result.event, ...prev].slice(0, EVENTS_MAX)
        );
      }
    },
  });

  const [saveConfig, { loading: savingConfig }] = useLazyQuery(SET_AUTOMATION_CONFIG_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [createRule, { loading: creating }] = useLazyQuery(CREATE_AUTOMATION_RULE_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [updateRule, { loading: updating }] = useLazyQuery(UPDATE_AUTOMATION_RULE_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [deleteRule, { loading: deleting }] = useLazyQuery(DELETE_AUTOMATION_RULE_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [clearOverride, { loading: clearing }] = useLazyQuery(CLEAR_AUTOMATION_OVERRIDE_QUERY, {
    fetchPolicy: 'no-cache',
  });

  const isSaving = savingConfig || creating || updating || deleting || clearing;

  const config = data?.Automation?.config?.result;
  const rules = data?.Automation?.rules?.result || [];
  const descriptors = data?.Automation?.signals?.result || [];
  const events = liveEvents;
  const state = liveState || data?.Automation?.state?.result;

  // Reset the pushed state when the config changes underneath it (e.g. the
  // automation was just disabled) so the card never shows a stale decision.
  useEffect(() => {
    if (config && !config.enabled) setLiveState(null);
  }, [config]);

  const report = (error, successId) => {
    if (error) {
      dispatch(sendFeedback({ message: error.message, type: 'error' }));
      return false;
    }
    if (successId) {
      dispatch(sendFeedback({ message: intl.formatMessage({ id: successId }), type: 'success' }));
    }
    return true;
  };

  const handleSaveConfig = async (input, successId = 'automation.feedback.saved') => {
    const { data: result } = await saveConfig({ variables: { input } });
    if (report(result?.Automation?.updateConfig?.error, successId)) await refetch();
  };

  const handleSaveRule = async ({ id, input }) => {
    // Priority is set by the list order (drag to reorder), not typed in. A brand
    // new rule goes to the bottom = lowest precedence.
    const nextPriority = (rules.reduce((max, r) => Math.max(max, r.priority || 0), 0) || 0) + 10;
    const payloadInput = id ? input : { ...input, priority: nextPriority };

    const { data: result } = id
      ? await updateRule({ variables: { id, input: payloadInput } })
      : await createRule({ variables: { input: payloadInput } });

    const payload = id ? result?.Automation?.updateRule : result?.Automation?.createRule;
    if (!report(payload?.error, 'automation.feedback.rule_saved')) return;

    setEditorOpen(false);
    setEditingRule(null);
    await refetch();
  };

  const handleDeleteRule = async (rule) => {
    const { data: result } = await deleteRule({ variables: { id: rule.id } });
    if (report(result?.Automation?.deleteRule?.error, 'automation.feedback.rule_deleted')) await refetch();
  };

  // Persist the dragged order as priorities (top of the list wins). Only the
  // rules whose position actually changed are written.
  const handleReorder = async (orderedRules) => {
    const updates = orderedRules
      .map((rule, i) => ({ id: rule.id, priority: (i + 1) * 10 }))
      .filter(({ id, priority }) => rules.find((r) => r.id === id)?.priority !== priority);
    if (!updates.length) return;

    for (const u of updates) {
      // eslint-disable-next-line no-await-in-loop
      await updateRule({ variables: { id: u.id, input: { priority: u.priority } } });
    }
    await refetch();
  };

  const handleClearOverride = async () => {
    const { data: result } = await clearOverride();
    if (report(result?.Automation?.clearOverride?.error, 'automation.feedback.resumed')) await refetch();
  };

  const price = state?.signals?.find((s) => s.id === 'energy.price' && !s.stale)?.value;
  const band = state?.signals?.find((s) => s.id === 'energy.band' && !s.stale)?.value;

  // Location lives in Settings now. Nudge the user there only when it actually
  // matters: a rule reads a sun signal but no coordinates are set, so that rule
  // can never match (the signal is stale).
  // Single source of truth for the miner modes: the backend descriptor.
  const minerModes = descriptors.find((d) => d.id === 'miner.mode')?.options || [];

  // The tariff band names currently defined — the "energy.band" condition can
  // only reference one of these, and cannot be added when there are none.
  const bands = [...new Set((config?.tariff?.periods || []).map((p) => p.band).filter(Boolean))];

  const locationMissing = config && (config.latitude == null || config.longitude == null);
  const usesSunSignal = rules.some((rule) =>
    (rule.conditions || []).some((c) => c.signal?.startsWith('sun.'))
  );
  const showLocationAlert = locationMissing && usesSunSignal;

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      <Head>
        <title>{intl.formatMessage({ id: 'automation.title' })}</title>
      </Head>

      <RuleEditorModal
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        rule={editingRule}
        descriptors={descriptors}
        bands={bands}
        temperatureUnit={temperatureUnit}
        isSaving={isSaving}
      />

      <RuleTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        locationSet={config?.latitude != null && config?.longitude != null}
        onPick={(templateRule) => {
          setEditingRule(templateRule);
          setEditorOpen(true);
        }}
      />

      {showLocationAlert && (
        <Alert status="warning" borderRadius="12px" mb="20px">
          <AlertIcon />
          <AlertDescription>
            {intl.formatMessage(
              { id: 'automation.location_alert' },
              {
                link: (
                  <Link as={NextLink} href="/settings/system" fontWeight="700" textDecoration="underline">
                    {intl.formatMessage({ id: 'automation.location_alert_link' })}
                  </Link>
                ),
              }
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* The master control stays put across both tabs. */}
      <Box mb="20px">
        <AutomationStatusCard
          config={config}
          state={state}
          isSaving={isSaving}
          onToggleEnabled={(enabled) => handleSaveConfig({ enabled })}
          onToggleDryRun={(dryRun) => handleSaveConfig({ dryRun })}
          onClearOverride={handleClearOverride}
        />
      </Box>

      <Tabs index={activeTab} onChange={setActiveTab} variant="line" isLazy>
        <TabList mb="20px">
          <Tab _selected={tabSelected} fontWeight="600">
            {intl.formatMessage({ id: 'automation.tabs.rules' })}
          </Tab>
          <Tab _selected={tabSelected} fontWeight="600">
            {intl.formatMessage({ id: 'automation.tabs.setup' })}
          </Tab>
        </TabList>

        <TabPanels>
          {/* Operational: what it's doing, the rules, the history. */}
          <TabPanel px="0" pt="0">
            <Flex direction="column" gap="20px">
              <CurrentConditionsCard
                signals={state?.signals}
                descriptors={descriptors}
                temperatureUnit={temperatureUnit}
                currency={config?.tariff?.currency || 'EUR'}
                locationSet={config?.latitude != null && config?.longitude != null}
              />

              <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap="20px">
                <GridItem>
                  <RulesList
                    rules={rules}
                    descriptors={descriptors}
                    temperatureUnit={temperatureUnit}
                    activeRuleId={state?.decision?.ruleId}
                    isSaving={isSaving}
                    onCreate={() => {
                      setEditingRule(null);
                      setEditorOpen(true);
                    }}
                    onBrowseTemplates={() => setTemplatesOpen(true)}
                    onEdit={(rule) => {
                      setEditingRule(rule);
                      setEditorOpen(true);
                    }}
                    onToggle={(rule, enabled) => handleSaveRule({ id: rule.id, input: { enabled } })}
                    onDelete={handleDeleteRule}
                    onReorder={handleReorder}
                  />
                </GridItem>
                <GridItem>
                  <EventsTimeline
                    events={events}
                    rules={rules}
                    hasMore={(data?.Automation?.events?.result?.length || 0) >= eventsLimit && eventsLimit < EVENTS_MAX}
                    loadingMore={loading}
                    onLoadMore={() => setEventsLimit((n) => Math.min(n + 30, EVENTS_MAX))}
                  />
                </GridItem>
              </Grid>
            </Flex>
          </TabPanel>

          {/* Setup: configure once — applies to all rules. */}
          <TabPanel px="0" pt="0">
            <Text fontSize="sm" color={hintColor} mb="16px">
              {intl.formatMessage({ id: 'automation.setup.hint' })}
            </Text>
            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="20px">
              <GridItem>
                <Flex direction="column" gap="20px">
                  <GuardRailsCard config={config} minerModes={minerModes} isSaving={isSaving} onSave={handleSaveConfig} />
                  <TariffCard
                    config={config}
                    currentPrice={price}
                    currentBand={band}
                    isSaving={isSaving}
                    onSave={handleSaveConfig}
                  />
                </Flex>
              </GridItem>
              <GridItem>
                <MqttInputsCard />
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Automation;
