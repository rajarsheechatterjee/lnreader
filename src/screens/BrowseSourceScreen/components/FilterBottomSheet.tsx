import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import BottomSheet from '@components/BottomSheet/BottomSheet';
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { useTheme } from '@hooks/persisted';
import {
  FilterTypes,
  FilterToValues,
  Filters,
} from '@plugins/types/filterTypes';
import { Button } from '@components/index';
import { Checkbox } from '@components/Checkbox/Checkbox';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { useBoolean } from '@hooks';
import { Menu, TextInput, overlay } from 'react-native-paper';
import { getValueFor } from './filterUtils';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Switch from '@components/Switch/Switch';

const insertOrRemoveIntoArray = (array: string[], val: string): string[] =>
  array.indexOf(val) > -1 ? array.filter(ele => ele !== val) : [...array, val];

type SelectedFilters = FilterToValues<Filters>;

interface FilterItemProps {
  theme: ThemeColors;
  filter: Filters[string];
  filterKey: keyof Filters;
  selectedFilters: SelectedFilters;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilters>>;
}

const FilterItem: React.FC<FilterItemProps> = ({
  theme,
  filter,
  filterKey,
  selectedFilters,
  setSelectedFilters,
}) => {
  const {
    value: isVisible,
    toggle: toggleCard,
    setFalse: closeCard,
  } = useBoolean();
  const { width: screenWidth } = useWindowDimensions();
  if (filter.type === FilterTypes.TextInput) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View style={styles.textContainer}>
        <TextInput
          style={{ flex: 1, width: screenWidth - 48 }}
          mode="outlined"
          label={
            <Text
              style={[
                styles.label,
                {
                  color: theme.onSurface,
                  backgroundColor: overlay(2, theme.surface),
                },
              ]}
            >
              {` ${filter.label} `}
            </Text>
          }
          defaultValue={value}
          theme={{ colors: { background: 'transparent' } }}
          outlineColor={theme.onSurface}
          textColor={theme.onSurface}
          onChangeText={text =>
            setSelectedFilters(prevState => ({
              ...prevState,
              [filterKey]: { value: text, type: FilterTypes.TextInput },
            }))
          }
        />
      </View>
    );
  }
  if (filter.type === FilterTypes.Picker) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    const label =
      filter.options.find(option => option.value === value)?.label ||
      'whatever';
    return (
      <View style={styles.pickerContainer}>
        <Menu
          style={{ flex: 1 }}
          visible={isVisible}
          contentStyle={{ backgroundColor: theme.surfaceVariant }}
          anchor={
            <Pressable
              style={{ flex: 1, width: screenWidth - 48 }}
              onPress={toggleCard}
            >
              <TextInput
                mode="outlined"
                label={
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isVisible ? theme.primary : theme.onSurface,
                        backgroundColor: overlay(2, theme.surface),
                      },
                    ]}
                  >
                    {` ${filter.label} `}
                  </Text>
                }
                value={label}
                editable={false}
                theme={{ colors: { background: 'transparent' } }}
                outlineColor={isVisible ? theme.primary : theme.onSurface}
                textColor={isVisible ? theme.primary : theme.onSurface}
              />
            </Pressable>
          }
          onDismiss={closeCard}
        >
          {filter.options.map(val => {
            return (
              <Menu.Item
                key={val.label}
                title={val.label}
                titleStyle={{ color: theme.onSurfaceVariant }}
                onPress={() => {
                  closeCard();
                  setSelectedFilters(prevFilters => ({
                    ...prevFilters,
                    [filterKey]: { value: val.value, type: FilterTypes.Picker },
                  }));
                }}
              />
            );
          })}
        </Menu>
      </View>
    );
  }
  if (filter.type === FilterTypes.CheckboxGroup) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View>
        <Pressable
          style={styles.checkboxHeader}
          onPress={toggleCard}
          android_ripple={{ color: theme.rippleColor }}
        >
          <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {filter.label}
          </Text>
          <MaterialCommunityIcons
            name={isVisible ? 'chevron-up' : 'chevron-down'}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible
          ? filter.options.map(val => {
              return (
                <Checkbox
                  key={val.label}
                  label={val.label}
                  theme={theme}
                  status={value.includes(val.value)}
                  onPress={() =>
                    setSelectedFilters(prevFilters => ({
                      ...prevFilters,
                      [filterKey]: {
                        type: FilterTypes.CheckboxGroup,
                        value: insertOrRemoveIntoArray(value, val.value),
                      },
                    }))
                  }
                />
              );
            })
          : null}
      </View>
    );
  }
  if (filter.type === FilterTypes.Switch) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        style={[styles.container]}
        onPress={() => {
          setSelectedFilters(prevState => ({
            ...prevState,
            [filterKey]: { value: !value, type: FilterTypes.Switch },
          }));
        }}
      >
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={[{ color: theme.onSurface }, styles.switchLabel]}>
              {filter.label}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={() => {
              setSelectedFilters(prevState => ({
                ...prevState,
                [filterKey]: { value: !value, type: FilterTypes.Switch },
              }));
            }}
            theme={theme}
          />
        </View>
      </Pressable>
    );
  }
  if (filter.type === FilterTypes.ExcludableCheckboxGroup) {
    const value = getValueFor<(typeof filter)['type']>(
      filter,
      selectedFilters[filterKey],
    );
    return (
      <View>
        <Pressable
          style={styles.checkboxHeader}
          onPress={toggleCard}
          android_ripple={{ color: theme.rippleColor }}
        >
          <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            {filter.label}
          </Text>
          <MaterialCommunityIcons
            name={isVisible ? 'chevron-up' : 'chevron-down'}
            color={theme.onSurface}
            size={24}
          />
        </Pressable>
        {isVisible
          ? filter.options.map(val => {
              return (
                <Checkbox
                  key={val.label}
                  label={val.label}
                  theme={theme}
                  status={
                    value.include?.includes(val.value)
                      ? true
                      : value.exclude?.includes(val.value)
                      ? 'indeterminate'
                      : false
                  }
                  onPress={() => {
                    if (value.exclude?.includes(val.value)) {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [...(value.include || [])],
                              exclude: [
                                ...(value.exclude?.filter(
                                  f => f !== val.value,
                                ) || []),
                              ],
                            },
                          },
                        };
                      });
                    } else if (value.include?.includes(val.value)) {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [
                                ...(value.include?.filter(
                                  f => f !== val.value,
                                ) || []),
                              ],
                              exclude: [...(value.exclude || []), val.value],
                            },
                          },
                        };
                      });
                    } else {
                      setSelectedFilters(prev => {
                        return {
                          ...prev,
                          [filterKey]: {
                            type: FilterTypes.ExcludableCheckboxGroup,
                            value: {
                              include: [...(value.include || []), val.value],
                              exclude: value.exclude,
                            },
                          },
                        };
                      });
                    }
                  }}
                />
              );
            })
          : null}
      </View>
    );
  }
  return <></>;
};

interface BottomSheetProps {
  filterSheetRef: React.RefObject<BottomSheetModal> | null;
  filters: Filters;
  setFilters: (filters?: SelectedFilters) => void;
  clearFilters: (filters: Filters) => void;
}

const FilterBottomSheet: React.FC<BottomSheetProps> = ({
  filters,
  filterSheetRef,
  clearFilters,
  setFilters,
}) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilters>(filters);

  return (
    <BottomSheet
      bottomSheetRef={filterSheetRef}
      snapPoints={[400, 600]}
      bottomInset={bottom}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      style={[styles.container, { backgroundColor: overlay(2, theme.surface) }]}
    >
      <BottomSheetView
        style={[styles.buttonContainer, { borderBottomColor: theme.outline }]}
      >
        <Button
          title={getString('common.reset')}
          onPress={() => {
            setSelectedFilters(filters);
            clearFilters(filters);
          }}
        />
        <Button
          title={getString('common.filter')}
          textColor={theme.onPrimary}
          onPress={() => {
            setFilters(selectedFilters);
            filterSheetRef?.current?.close();
          }}
          mode="contained"
        />
      </BottomSheetView>
      <BottomSheetFlatList
        data={filters && Object.entries(filters)}
        keyExtractor={item => 'filter' + item[0]}
        renderItem={({ item }) => (
          <FilterItem
            theme={theme}
            filter={item[1]}
            filterKey={item[0]}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        )}
      />
    </BottomSheet>
  );
};

export default FilterBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
  },
  switchLabelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  picker: {
    width: 200,
    paddingHorizontal: 24,
  },
  checkboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});
