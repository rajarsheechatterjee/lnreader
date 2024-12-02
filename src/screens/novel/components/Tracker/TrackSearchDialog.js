import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { Modal, overlay, TextInput, TouchableRipple } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import color from 'color';
import { Button } from '@components';
import { getTracker } from '@hooks/persisted';
import { getString } from '@strings/translations';

const TrackSearchDialog = ({
  tracker,
  trackNovel,
  trackSearchDialog,
  setTrackSearchDialog,
  novelName,
  theme,
}) => {
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState(novelName);

  const [selectedNovel, setSelectedNovel] = useState();

  const getSearchresults = async () => {
    setLoading(true);
    const trackerObj = getTracker(tracker.name);
    const results = await trackerObj.handleSearch(searchText, tracker.auth);
    setSearchResults(results);
    setLoading(false);
  };

  useEffect(() => {
    trackSearchDialog && getSearchresults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSearchDialog]);

  /**
   * @param {import('../../../../services/Trackers').SearchResult} item
   */
  const renderSearchResultCard = item => (
    <TouchableRipple
      style={[
        { flexDirection: 'row', borderRadius: 4, margin: 8 },
        selectedNovel &&
          selectedNovel.id === item.id && {
            backgroundColor: color(theme.primary).alpha(0.12).string(),
          },
      ]}
      key={item.id}
      onPress={() => setSelectedNovel(item)}
      rippleColor={color(theme.primary).alpha(0.12).string()}
      borderless
    >
      <>
        {selectedNovel && selectedNovel.id === item.id ? (
          <MaterialCommunityIcons
            name="check-circle"
            color={theme.primary}
            size={24}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          />
        ) : null}
        <Image
          source={{ uri: item.coverImage }}
          style={{ height: 150, width: 100, borderRadius: 4 }}
        />
        <Text
          style={{
            flex: 1,
            color: theme.onSurface,
            marginLeft: 20,
            fontSize: 16,
            flexWrap: 'wrap',
            padding: 8,
            paddingLeft: 0,
          }}
        >
          {item.title}
        </Text>
      </>
    </TouchableRipple>
  );

  return (
    <Modal
      visible={trackSearchDialog}
      onDismiss={() => setTrackSearchDialog(false)}
      contentContainerStyle={[
        styles.containerStyle,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
      theme={{ colors: { backdrop: 'rgba(0,0,0,0.25)' } }}
    >
      <TextInput
        value={searchText}
        onChangeText={text => setSearchText(text)}
        onSubmitEditing={getSearchresults}
        textColor={theme.onSurface}
        theme={{
          colors: {
            primary: theme.primary,
            text: theme.onSurface,
          },
        }}
        style={{ backgroundColor: 'transparent' }}
        underlineColor={theme.outline}
        right={
          <TextInput.Icon
            color={theme.onSurfaceVariant}
            icon="close"
            onPress={() => setSearchText('')}
          />
        }
      />
      <ScrollView style={{ flexGrow: 1, maxHeight: 500, marginVertical: 8 }}>
        {loading ? (
          <ActivityIndicator
            color={theme.primary}
            size={45}
            style={{ margin: 16 }}
          />
        ) : (
          searchResults &&
          searchResults.map(result => renderSearchResultCard(result))
        )}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 30,
        }}
      >
        <Button onPress={() => setSelectedNovel(null)}>
          {getString('common.remove')}
        </Button>
        <View style={{ flexDirection: 'row' }}>
          <Button onPress={() => setTrackSearchDialog(false)}>
            {getString('common.cancel')}
          </Button>
          <Button
            onPress={async () => {
              if (selectedNovel) {
                trackNovel(tracker, selectedNovel);
              }
              setTrackSearchDialog(false);
            }}
          >
            OK
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default TrackSearchDialog;

const styles = StyleSheet.create({
  containerStyle: {
    padding: 20,
    margin: 20,
    borderRadius: 6,
  },
});
