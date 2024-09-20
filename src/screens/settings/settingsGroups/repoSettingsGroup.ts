import { SettingsGroup } from '../Settings.d';

const RepoSettings: SettingsGroup = {
  groupTitle: 'Repositories',
  icon: 'github',
  navigateParam: 'RepoSettings',
  subGroup: [
    {
      subGroupTitle: '',
      settings: [
        {
          type: 'Repo',
        },
      ],
    },
  ],
};
export default RepoSettings;
