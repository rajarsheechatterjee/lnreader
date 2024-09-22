import { List } from '@components';
import { useTheme } from '@hooks/persisted';

export default function InfoItem({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <List.InfoItem title={title} icon="information-outline" theme={theme} />
  );
}
