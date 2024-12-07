import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Appbar, EmptyView } from '@components/index';
import AddCategoryModal from './components/AddCategoryModal';

import {
  getCategoriesFromDb,
  updateCategoryOrderInDb,
} from '@database/queries/CategoryQueries';
import { useBoolean } from '@hooks';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import { Category } from '@database/types';
import CategoryCard from './components/CategoryCard';
import { orderBy } from 'lodash-es';
import CategorySkeletonLoading from './components/CategorySkeletonLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CategoriesScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>();
  const { bottom } = useSafeAreaInsets();

  const {
    value: categoryModalVisible,
    setTrue: showCategoryModal,
    setFalse: closeCategoryModal,
  } = useBoolean();

  const getCategories = async () => {
    try {
      let res = getCategoriesFromDb();
      setCategories(res);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);
  const updateCategorySort = (currentIndex: number, newIndex: number) => {
    // Do not set local as default one
    if (
      (newIndex === 0 &&
        currentIndex == 1 &&
        categories?.[currentIndex].id === 2) ||
      (newIndex === 1 && currentIndex == 0 && categories?.[newIndex].id === 2)
    ) {
      return;
    }
    const updatedOrderCategories = orderBy(
      categories?.map((category, index) => {
        // + 1 because in db, sort start from 1

        // swap adjacent cards
        if (index === currentIndex) {
          return { ...category, sort: newIndex + 1 };
        }
        if (index === newIndex) {
          return { ...category, sort: currentIndex + 1 };
        }
        return category;
      }),
      'sort',
    );
    setCategories(updatedOrderCategories);
    updateCategoryOrderInDb(updatedOrderCategories || []);
  };

  return (
    <>
      <Appbar
        title={getString('categories.header')}
        handleGoBack={goBack}
        theme={theme}
      />
      {isLoading ? (
        <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
      ) : (
        <FlatList
          data={categories}
          contentContainerStyle={styles.contentCtn}
          renderItem={({ item, index }) => (
            <CategoryCard
              category={item}
              getCategories={getCategories}
              categoryIndex={index}
              updateCategorySort={updateCategorySort}
              totalCategories={categories?.length || 0}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="Σ(ಠ_ಠ)"
              description={getString('categories.emptyMsg')}
              theme={theme}
            />
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary, bottom: bottom }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showCategoryModal}
        icon={'plus'}
      />

      <AddCategoryModal
        visible={categoryModalVisible}
        closeModal={closeCategoryModal}
        onSuccess={getCategories}
      />
    </>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
