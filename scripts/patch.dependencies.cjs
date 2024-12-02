const path = require('path');
const fs = require('fs');

// temporary fix for react-native-paper icons
const ReactNativePaperIconPath = path.join(
  'node_modules',
  'react-native-paper',
  'src',
  'components',
  'MaterialCommunityIcon.tsx',
);

const content = fs.readFileSync(ReactNativePaperIconPath, 'utf-8');

fs.writeFileSync(
  ReactNativePaperIconPath,
  content.replace(
    /react-native-vector-icons\/MaterialCommunityIcons/g,
    '@react-native-vector-icons/material-design-icons',
  ),
  'utf-8',
);
