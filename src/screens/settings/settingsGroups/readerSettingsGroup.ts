import { getString } from '@strings/translations';
import { SettingsGroup } from '../Settings';

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
        {
          title: getString('readerScreen.bottomSheet.autoscroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'autoScroll',
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
      subGroupTitle: getString('readerScreen.bottomSheet.autoscroll'),
      settings: [
        {
          title: getString('readerScreen.bottomSheet.autoscroll'),
          type: 'Switch',
          settingOrigin: 'GeneralChapter',
          valueKey: 'autoScroll',
          defaultValue: false,
        },
      ],
    },
  ],
};
export default ReaderSettings;
