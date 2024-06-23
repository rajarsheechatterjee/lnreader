import { SettingsSubGroupSettings } from '../Settings';
import DefaultSettingModal from '../SettingsGeneralScreen/modals/DefaultSettingModal';
import SettingSwitchV2 from './SettingSwitchV2';
import { useTheme } from '@hooks/persisted';
import SettingsThemePicker from './SettingsThemePicker';
import ColorPickerModal from '../SettingsGeneralScreen/modals/ColorPickerModal';
import SettingTextInput from './SettingTextInput';

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
  }
}
