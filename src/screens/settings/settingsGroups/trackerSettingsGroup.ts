import { getString } from '@strings/translations';
import { SettingsGroup } from '../Settings.d';

const TrackerSettings: SettingsGroup = {
  groupTitle: getString('tracking'),
  icon: 'sync',
  navigateParam: 'TrackerSettings',
  subGroup: [
    {
      subGroupTitle: getString('trackingScreen.services'),
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
