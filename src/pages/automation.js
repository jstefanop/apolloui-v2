import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Grid, GridItem, Spinner, Flex } from '@chakra-ui/react';
import { useQuery, useLazyQuery, useSubscription } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

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
import RulesList from '../components/automation/RulesList';
import RuleEditorModal from '../components/automation/RuleEditorModal';
import GuardRailsCard from '../components/automation/GuardRailsCard';
import TariffCard from '../components/automation/TariffCard';
import LocationCard from '../components/automation/LocationCard';
import EventsTimeline from '../components/automation/EventsTimeline';

const Automation = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [liveState, setLiveState] = useState(null);

  const { data, loading, refetch } = useQuery(GET_AUTOMATION_QUERY, {
    fetchPolicy: 'network-only',
  });

  // The scheduler pushes a fresh decision every tick, so the page reflects what
  // the engine is thinking without polling it.
  useSubscription(AUTOMATION_SUBSCRIPTION, {
    onData: ({ data: pushed }) => {
      const result = pushed?.data?.automation?.result;
      if (result) setLiveState(result);
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
  const events = data?.Automation?.events?.result || [];
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
    const { data: result } = id
      ? await updateRule({ variables: { id, input } })
      : await createRule({ variables: { input } });

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

  const handleClearOverride = async () => {
    const { data: result } = await clearOverride();
    if (report(result?.Automation?.clearOverride?.error, 'automation.feedback.resumed')) await refetch();
  };

  const price = state?.signals?.find((s) => s.id === 'energy.price' && !s.stale)?.value;
  const sunSignals = (state?.signals || []).filter((s) => s.id.startsWith('sun.'));

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
        isSaving={isSaving}
      />

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap="20px">
        <GridItem colSpan={{ base: 1, xl: 2 }}>
          <AutomationStatusCard
            config={config}
            state={state}
            isSaving={isSaving}
            onToggleEnabled={(enabled) => handleSaveConfig({ enabled })}
            onToggleDryRun={(dryRun) => handleSaveConfig({ dryRun })}
            onClearOverride={handleClearOverride}
          />
        </GridItem>

        <GridItem>
          <Flex direction="column" gap="20px">
            <RulesList
              rules={rules}
              descriptors={descriptors}
              activeRuleId={state?.decision?.ruleId}
              isSaving={isSaving}
              onCreate={() => {
                setEditingRule(null);
                setEditorOpen(true);
              }}
              onEdit={(rule) => {
                setEditingRule(rule);
                setEditorOpen(true);
              }}
              onToggle={(rule, enabled) => handleSaveRule({ id: rule.id, input: { enabled } })}
              onDelete={handleDeleteRule}
            />

            <TariffCard
              config={config}
              currentPrice={price}
              isSaving={isSaving}
              onSave={handleSaveConfig}
            />
          </Flex>
        </GridItem>

        <GridItem>
          <Flex direction="column" gap="20px">
            <GuardRailsCard config={config} isSaving={isSaving} onSave={handleSaveConfig} />
            <LocationCard
              config={config}
              sunSignals={sunSignals}
              isSaving={isSaving}
              onSave={handleSaveConfig}
            />
            <EventsTimeline events={events} />
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Automation;
