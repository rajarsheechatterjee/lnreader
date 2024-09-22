import React, { memo, useState } from 'react';
import { View } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';

import { getTracker, useTheme, useTracker } from '@hooks/persisted';
import { List } from '@components';
import { getString } from '@strings/translations';

const TrackerButton = ({
  trackerName,
}: {
  trackerName: 'AniList' | 'MyAnimeList';
}) => {
  const theme = useTheme();
  const { tracker, removeTracker, setTracker } = useTracker();

  // Tracker Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  return (
    <>
      <List.Item
        title={trackerName}
        onPress={async () => {
          if (tracker) {
            showModal();
          } else {
            const auth = await getTracker(trackerName).authenticate();
            if (auth) {
              setTracker(trackerName, auth);
            }
          }
        }}
        right={tracker?.name === trackerName ? 'check' : undefined}
        theme={theme}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            padding: 20,
            margin: 20,
            borderRadius: 6,
            backgroundColor: theme.overlay3,
          }}
        >
          <Text
            style={{
              color: theme.onSurface,
              fontSize: 18,
            }}
          >
            {getString('trackingScreen.logOutMessage', {
              name: tracker?.name,
            })}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              style={{ marginTop: 30 }}
              labelStyle={{
                color: theme.primary,
                letterSpacing: 0,
                textTransform: 'none',
              }}
              onPress={hideModal}
            >
              {getString('common.cancel')}
            </Button>
            <Button
              style={{ marginTop: 30 }}
              labelStyle={{
                color: theme.primary,
                letterSpacing: 0,
                textTransform: 'none',
              }}
              onPress={() => {
                removeTracker();
                hideModal();
              }}
            >
              {getString('common.logout')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};
export default memo(TrackerButton);
