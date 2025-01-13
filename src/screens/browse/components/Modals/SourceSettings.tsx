import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';
import { Button } from '@components/index';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { Storage } from '@plugins/helpers/storage';
import { unloadPlugin } from '@plugins/pluginManager';
import { SwitchItem } from '@components';

interface PluginSetting {
  value: string;
  label: string;
  type?: 'Switch';
}

interface PluginSettings {
  [key: string]: PluginSetting;
}

interface SourceSettingsModal {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description?: string;
  pluginId: string;
  pluginSettings?: PluginSettings;
}

const SourceSettingsModal: React.FC<SourceSettingsModal> = ({
  onDismiss,
  visible,
  title,
  description,
  pluginId,
  pluginSettings,
}) => {
  const theme = useTheme();

  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (pluginSettings) {
      const storage = new Storage(pluginId);

      const loadFormValues = async () => {
        const loadedValues = await Promise.all(
          Object.keys(pluginSettings).map(async key => {
            const storedValue = await storage.get(key);
            return {
              key,
              value:
                storedValue !== null ? storedValue : pluginSettings[key].value,
            };
          }),
        );

        const initialFormValues = Object.fromEntries(
          loadedValues.map(({ key, value }) => [key, value]),
        );

        setFormValues(initialFormValues);
      };

      loadFormValues();
    }
  }, [pluginSettings, pluginId]);

  const handleChange = (key: string, value: string) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const storage = new Storage(pluginId);
    Object.entries(formValues).forEach(([key, value]) => {
      storage.set(key, value);
    });
    unloadPlugin(pluginId);
    onDismiss();
  };

  if (!pluginSettings || Object.keys(pluginSettings).length === 0) {
    return (
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {title}
        </Text>
        <Text style={[{ color: theme.onSurfaceVariant }]}>
          {description || 'No settings available.'}
        </Text>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
      <Text style={[{ color: theme.onSurfaceVariant }]}>{description}</Text>

      {Object.entries(pluginSettings).map(([key, setting]) =>
        setting?.type === 'Switch' ? (
          <SwitchItem
            key={key}
            label={setting.label}
            value={!!formValues[key]}
            onPress={() => handleChange(key, formValues[key] ? '' : 'true')}
            theme={theme}
          />
        ) : (
          <TextInput
            key={key}
            mode="outlined"
            label={setting.label}
            value={formValues[key] || ''}
            onChangeText={value => handleChange(key, value)}
            placeholder={`Enter ${setting.label}`}
            placeholderTextColor={theme.onSurfaceDisabled}
            underlineColor={theme.outline}
            style={[{ color: theme.onSurface }, styles.textInput]}
            theme={{ colors: { ...theme } }}
          />
        ),
      )}

      <View style={styles.customCSSButtons}>
        <Button
          onPress={handleSave}
          style={styles.button}
          title={getString('common.save')}
          mode="contained"
        />
      </View>
    </Modal>
  );
};

export default SourceSettingsModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  customCSSButtons: {
    flexDirection: 'row',
  },
  button: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: 8,
  },
});
