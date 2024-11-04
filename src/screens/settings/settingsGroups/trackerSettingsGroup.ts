import { getString } from '@strings/translations';
import { SettingsGroup, trackerIds } from '../Settings.d';

const TrackerSettings: SettingsGroup<trackerIds> = {
  groupTitle: getString('tracking'),
  icon: 'sync',
  navigateParam: 'TrackerSettings',
  subGroup: [
    {
      subGroupTitle: getString('trackingScreen.services'),
      id: 'services',
      settings: [
        {
          type: 'Tracker',
          trackerName: 'AniList',
        },
        { type: 'Tracker', trackerName: 'MyAnimeList' },
      ],
    },
  ],
};
export default TrackerSettings;
