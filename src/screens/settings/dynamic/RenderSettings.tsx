import { SettingsSubGroupSettings } from '../Settings.d';
import SettingSwitchV2 from './components/SettingSwitchV2';
import { useTheme } from '@hooks/persisted';
import SettingsThemePicker from '../components/SettingsThemePicker';
import ColorPickerModal from './modals/ColorPickerModal';
import SettingTextInput from './components/SettingTextInput';
import SelectionSettingModal from './modals/SelectionSettingModal';
import TextAreaModal from './modals/TextAreaModal';
import ReaderThemeSettings from './components/ReaderThemeSettings';
import TextToSpeechSettings from './components/TextToSpeechSettings';
import RepoSettings from './components/RepoSettings';
import TrackerButton from './components/TrackerButton';
import InfoItem from './components/InfoItem';
import { memo } from 'react';

const renderSettings = ({
  setting,
  quickSettings,
}: {
  setting: SettingsSubGroupSettings;
  quickSettings?: boolean;
}) => {
  const theme = useTheme();

  switch (setting.type) {
    case 'Modal':
      return (
        <SelectionSettingModal
          setting={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'Switch':
      return (
        <SettingSwitchV2
          setting={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'ThemePicker':
      return (
        <SettingsThemePicker
          settings={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'NumberInput':
      return (
        <SettingTextInput
          setting={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'ColorPicker':
      return (
        <ColorPickerModal
          settings={setting}
          theme={theme}
          showAccentColors
          quickSettings={quickSettings}
        />
      );
    case 'TextArea':
      return (
        <TextAreaModal
          setting={setting}
          theme={theme}
          quickSettings={quickSettings}
        />
      );
    case 'ReaderTheme':
      return <ReaderThemeSettings />;
    case 'TTS':
      return <TextToSpeechSettings />;
    case 'Repo':
      return <RepoSettings />;
    case 'Tracker':
      return <TrackerButton trackerName={setting.trackerName} />;
    case 'InfoItem':
      return <InfoItem title={setting.title} />;
  }
};
export default memo(renderSettings, () => true);
