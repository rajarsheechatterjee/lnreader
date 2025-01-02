import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeVolumeButtonListener',
);
