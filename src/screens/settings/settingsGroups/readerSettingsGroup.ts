import { getString } from '@strings/translations';
import { SettingsGroup } from '../Settings.d';

const ReaderSettings: SettingsGroup = {
  groupTitle: getString('readerSettings.title'),
  icon: 'book-open-outline',
  navigateParam: 'ReaderSettings',
  subGroup: [
    {
      subGroupTitle: getString('generalSettings'),
      settings: [
        {
          title: getString('readerScreen.bottomSheet.verticalSeekbar'),
          description: getString('readerSettings.verticalSeekbarDesc'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'verticalSeekbar',
          defaultValue: true,
        },
        {
          title: getString('readerScreen.bottomSheet.volumeButtonsScroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'useVolumeButtons',
          defaultValue: false,
        },
        {
          title: getString('readerScreen.bottomSheet.swipeGestures'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'swipeGestures',
          defaultValue: false,
        },
        {
          title: getString('readerScreen.bottomSheet.bionicReading'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'bionicReading',
          defaultValue: false,
        },
      ],
    },
    {
      subGroupTitle: getString('readerScreen.bottomSheet.autoscroll'),
      settings: [
        {
          title: getString('readerScreen.bottomSheet.autoscroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'autoScroll',
          defaultValue: false,
          dependents: [
            {
              title: getString('readerSettings.autoScrollInterval'),
              type: 'NumberInput',
              settingOrigin: 'GeneralChapter',
              valueKey: 'autoScrollInterval',
              defaultValue: '10',
            },
            {
              title: getString('readerSettings.autoScrollOffset'),
              type: 'NumberInput',
              settingOrigin: 'GeneralChapter',
              valueKey: 'autoScrollOffset',
              defaultValue: '',
              // defaultValue: defaultTo(
              //   autoScrollOffset,
              //   Math.round(screenHeight),
              // ).toString(),
            },
          ],
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.customCSS'),
      settings: [
        {
          title: getString('readerSettings.customCSS'),
          type: 'TextArea',
          settingOrigin: 'ReaderChapter',
          valueKey: 'customCSS',
          placeholder: 'body {margin: 10px;}',
          description: getString('readerSettings.cssHint'),
          openFileLabel: getString('readerSettings.openCSSFile'),
          clearDialog: getString('readerSettings.clearCustomCSS'),
          defaultValue: '',
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.customJS'),
      settings: [
        {
          title: getString('readerSettings.customJS'),
          type: 'TextArea',
          settingOrigin: 'ReaderChapter',
          valueKey: 'customJS',
          placeholder: "document.getElementById('example');",
          description: getString('readerSettings.jsHint'),
          openFileLabel: getString('readerSettings.openJSFile'),
          clearDialog: getString('readerSettings.clearCustomJS'),
          defaultValue: '',
        },
      ],
    },
    {
      subGroupTitle: getString('common.display'),
      settings: [
        {
          title: getString('readerScreen.bottomSheet.fullscreen'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'fullScreenMode',
          defaultValue: true,
        },
        {
          title: getString('readerScreen.bottomSheet.showProgressPercentage'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showScrollPercentage',
          defaultValue: false,
        },
        {
          title: getString('readerScreen.bottomSheet.showBatteryAndTime'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showBatteryAndTime',
          defaultValue: false,
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.readerTheme'),
      settings: [
        {
          type: 'ReaderTheme',
        },
      ],
    },
    {
      subGroupTitle: 'TTS',
      settings: [
        {
          type: 'TTS',
        },
      ],
    },
  ],
};
export default ReaderSettings;
