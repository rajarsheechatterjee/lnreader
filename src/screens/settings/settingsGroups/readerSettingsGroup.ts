import { getString } from '@strings/translations';
import { readerIds, SettingsGroup } from '../Settings.d';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';

const ReaderSettings: SettingsGroup<readerIds> = {
  groupTitle: getString('readerSettings.title'),
  icon: 'book-open-outline',
  navigateParam: 'ReaderSettings',
  subGroup: [
    {
      subGroupTitle: getString('generalSettings'),
      id: 'general',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.keepScreenOn'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'keepScreenOn',
          defaultValue: true,
          quickSettings: true,
        },

        {
          title: getString('readerScreen.bottomSheet.swipeGestures'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'swipeGestures',
          defaultValue: false,
          quickSettings: true,
        },

        {
          title: getString('readerScreen.bottomSheet.pageReader'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'pageReader',
          defaultValue: false,
          quickSettings: true,
        },

        {
          title: getString('readerScreen.bottomSheet.volumeButtonsScroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'useVolumeButtons',
          defaultValue: false,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.tapToScroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'tapToScroll',
          defaultValue: false,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.removeExtraSpacing'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'removeExtraParagraphSpacing',
          defaultValue: false,
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: getString('readerScreen.bottomSheet.autoscroll'),
      id: 'autoScroll',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.autoscroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'autoScroll',
          defaultValue: false,
          quickSettings: true,

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
              defaultValue: WINDOW_HEIGHT.toFixed(),
            },
          ],
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.customCSS'),
      id: 'customCSS',
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
      id: 'customJS',
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
      id: 'display',
      settings: [
        {
          title: getString('readerScreen.bottomSheet.fullscreen'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'fullScreenMode',
          defaultValue: true,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.verticalSeekbar'),
          description: getString('readerSettings.verticalSeekbarDesc'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'verticalSeekbar',
          defaultValue: true,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.bionicReading'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'bionicReading',
          defaultValue: false,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.showProgressPercentage'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showScrollPercentage',
          defaultValue: false,
          quickSettings: true,
        },
        {
          title: getString('readerScreen.bottomSheet.showBatteryAndTime'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'showBatteryAndTime',
          defaultValue: false,
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: getString('readerSettings.readerTheme'),
      id: 'readerTheme',
      settings: [
        {
          type: 'ReaderTheme',
          quickSettings: true,
        },
      ],
    },
    {
      subGroupTitle: 'TTS',
      id: 'tts',
      settings: [
        {
          type: 'TTS',
        },
      ],
    },
  ],
};
export default ReaderSettings;
