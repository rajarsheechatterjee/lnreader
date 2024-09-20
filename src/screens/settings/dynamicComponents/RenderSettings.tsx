import { SettingsSubGroupSettings } from '../Settings.d';
import SettingSwitchV2 from './SettingSwitchV2';
import { useTheme } from '@hooks/persisted';
import SettingsThemePicker from '../components/SettingsThemePicker';
import ColorPickerModal from '../SettingsGeneralScreen/modals/ColorPickerModal';
import SettingTextInput from './SettingTextInput';
import DefaultSettingModal from './modals/DefaultSettingModal';
import TextAreaModal from './modals/TextAreaModal';

export default function ({ setting }: { setting: SettingsSubGroupSettings }) {
  const theme = useTheme();

  switch (setting.type) {
    case 'Modal':
      return <DefaultSettingModal setting={setting} theme={theme} />;
    case 'Switch':
      return <SettingSwitchV2 setting={setting} theme={theme} />;
    case 'ThemePicker':
      return <SettingsThemePicker settings={setting} theme={theme} />;
    case 'NumberInput':
      return <SettingTextInput setting={setting} theme={theme} />;
    case 'ColorPicker':
      return (
        <ColorPickerModal settings={setting} theme={theme} showAccentColors />
      );
    case 'TextArea':
      return <TextAreaModal setting={setting} theme={theme} />;
  }
}
