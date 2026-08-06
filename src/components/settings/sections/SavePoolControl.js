import { Flex, Input, Switch, Text, FormLabel } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import SimpleCard from '../../UI/SimpleCard';
import { isPoolAlreadySaved, suggestPoolName } from '../../../lib/poolOptions';

// "Add pool to list", for one pool.
//
// One per section, and rendered inside the section it belongs to: a single
// control under the primary fields silently ignored a custom backup pool, and
// left the user turning on a toggle that would keep a different pool than the
// one they were looking at.
const SavePoolControl = ({
  pool,
  profiles,
  value,
  onChange,
  visible,
  textColor,
  inputTextColor,
  idSuffix,
}) => {
  const intl = useIntl();
  const id = `savePoolProfile-${idSuffix}`;

  // Nothing to keep if this exact pool — worker and password included — is
  // already in the list, or if there is no save to hang it on.
  if (!visible || !pool?.url || isPoolAlreadySaved(profiles, pool)) return null;

  return (
    <SimpleCard title={''} textColor={textColor}>
      <Flex align="center" justify="space-between" wrap="wrap" gap="3">
        <Flex align="center" gap="3">
          <Switch
            id={id}
            isChecked={!!value?.enabled}
            onChange={(e) =>
              onChange({
                enabled: e.target.checked,
                // Seeded from the host so the common case is one click, and
                // never overwritten once the user has typed.
                name: value?.name || suggestPoolName(pool.url),
              })
            }
          />
          <FormLabel
            htmlFor={id}
            color={textColor}
            fontWeight="bold"
            mb="0"
            _hover={{ cursor: 'pointer' }}
          >
            {intl.formatMessage({ id: 'settings.actions.save_pool' })}
          </FormLabel>
        </Flex>
        {value?.enabled && (
          <Input
            color={inputTextColor}
            maxW={{ base: '100%', md: '320px' }}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder={intl.formatMessage({ id: 'settings.actions.save_pool_name' })}
          />
        )}
      </Flex>
      <Text fontSize="sm" color="gray.500" mt="2">
        {intl.formatMessage({ id: 'settings.actions.save_pool_hint' })}
      </Text>
    </SimpleCard>
  );
};

export default SavePoolControl;
