import React from 'react';
import {
  Button as PaperButton,
  ButtonProps as PaperButtonProps,
} from 'react-native-paper';

import { useTheme } from '@hooks/persisted';

interface ButtonProps extends Partial<PaperButtonProps> {
  title?: string;
  children?: string;
}

const Button: React.FC<ButtonProps> = props => {
  const theme = useTheme();

  return (
    <PaperButton {...props} theme={{ colors: theme }}>
      {props.title || props.children}
    </PaperButton>
  );
};

export default Button;
