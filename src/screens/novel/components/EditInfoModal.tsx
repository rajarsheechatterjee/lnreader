import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { Modal, Portal, TextInput } from 'react-native-paper';
import { updateNovelInfo } from '@database/queries/NovelQueries';

import { getString } from '@strings/translations';
import { Button } from '@components';
import { ThemeColors } from '@theme/types';
import { NovelInfo } from '@database/types';
import { NovelStatus } from '@plugins/types';
import { translateNovelStatus } from '@utils/translateEnum';

interface EditInfoModalProps {
  theme: ThemeColors;
  hideModal: () => void;
  modalVisible: boolean;
  novel: NovelInfo;
  setNovel: (novel: NovelInfo | undefined) => void;
}

const EditInfoModal = ({
  theme,
  hideModal,
  modalVisible,
  novel,
  setNovel,
}: EditInfoModalProps) => {
  const initialNovelInfo = { ...novel };
  const [novelInfo, setNovelInfo] = useState(novel);

  const [newGenre, setNewGenre] = useState('');

  const removeTag = (t: string) => {
    setNovelInfo({
      ...novel,
      genres: novelInfo.genres
        ?.split(',')
        .filter(item => item !== t)
        ?.join(','),
    });
  };

  const status = Object.values(NovelStatus);

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString('novelScreen.edit.info')}
        </Text>
        <View
          style={{
            marginVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.onSurfaceVariant }}>
            {getString('novelScreen.edit.status')}
          </Text>
          <ScrollView
            style={{ marginLeft: 8 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {status.map((item, index) => (
              <View
                style={{ borderRadius: 8, overflow: 'hidden' }}
                key={'novelInfo' + index}
              >
                <Pressable
                  style={{
                    backgroundColor:
                      novelInfo.status === item
                        ? theme.rippleColor
                        : 'transparent',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                  android_ripple={{
                    color: theme.rippleColor,
                  }}
                  onPress={() => setNovelInfo({ ...novel, status: item })}
                >
                  <Text
                    style={{
                      color:
                        novelInfo.status === item
                          ? theme.primary
                          : theme.onSurfaceVariant,
                    }}
                  >
                    {translateNovelStatus(item)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
        <TextInput
          defaultValue={initialNovelInfo.name}
          value={novelInfo.name}
          placeholder={getString('novelScreen.edit.title', {
            title: novel.name,
          })}
          numberOfLines={1}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          onChangeText={text => setNovelInfo({ ...novel, name: text })}
          dense
          style={styles.inputWrapper}
        />
        <TextInput
          defaultValue={initialNovelInfo.author}
          value={novelInfo.author}
          placeholder={getString('novelScreen.edit.author', {
            author: novel.author,
          })}
          numberOfLines={1}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          onChangeText={text => setNovelInfo({ ...novel, author: text })}
          dense
          style={styles.inputWrapper}
        />
        <TextInput
          defaultValue={initialNovelInfo.artist}
          value={novelInfo.artist}
          placeholder={'Artist: ' + novel.artist}
          numberOfLines={1}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          onChangeText={text => setNovelInfo({ ...novel, artist: text })}
          dense
          style={styles.inputWrapper}
        />
        <TextInput
          defaultValue={initialNovelInfo.summary}
          value={novelInfo.summary}
          placeholder={getString('novelScreen.edit.summary', {
            summary: novel.summary?.substring(0, 16),
          })}
          numberOfLines={1}
          mode="outlined"
          onChangeText={text => setNovelInfo({ ...novel, summary: text })}
          theme={{ colors: { ...theme } }}
          dense
          style={styles.inputWrapper}
        />

        <TextInput
          value={newGenre}
          placeholder={getString('novelScreen.edit.addTag')}
          numberOfLines={1}
          mode="outlined"
          onChangeText={text => setNewGenre(text)}
          onSubmitEditing={() => {
            setNovelInfo(prevVal => ({
              ...prevVal,
              genres: novelInfo.genres
                ? `${novelInfo.genres},`
                : '' + newGenre.trim(),
            }));
            setNewGenre('');
          }}
          theme={{ colors: { ...theme } }}
          dense
          style={styles.inputWrapper}
        />

        {novelInfo.genres !== undefined && novelInfo.genres !== '' ? (
          <FlatList
            style={{ marginVertical: 8 }}
            horizontal
            data={novelInfo.genres?.split(',')}
            keyExtractor={(_, index) => 'novelTag' + index}
            renderItem={({ item }) => (
              <GenreChip theme={theme} onPress={() => removeTag(item)}>
                {item}
              </GenreChip>
            )}
            showsHorizontalScrollIndicator={false}
          />
        ) : null}
        <View style={{ flexDirection: 'row' }}>
          <Button
            onPress={() => {
              setNovelInfo(initialNovelInfo);
              updateNovelInfo(initialNovelInfo);
            }}
          >
            {getString('common.reset')}
          </Button>
          <View style={{ flex: 1 }} />
          <Button
            onPress={() => {
              setNovel(novelInfo);
              updateNovelInfo(novelInfo);
              hideModal();
            }}
          >
            {getString('common.save')}
          </Button>
          <Button onPress={hideModal}>{getString('common.cancel')}</Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default EditInfoModal;

const GenreChip = ({
  children,
  theme,
  onPress,
}: {
  children: React.ReactNode;
  theme: ThemeColors;
  onPress: () => void;
}) => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 16,
      marginBottom: 4,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.secondaryContainer,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        color: theme.onSecondaryContainer,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
    <MaterialCommunityIcons
      name="close"
      color={theme.onSecondaryContainer}
      size={18}
      onPress={onPress}
      style={{ marginLeft: 4 }}
    />
  </View>
);

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF0033',
    paddingTop: 8,
  },
  inputWrapper: {
    fontSize: 14,
    marginBottom: 12,
  },
});
