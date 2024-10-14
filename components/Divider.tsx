import React from 'react';
import { View, StyleSheet } from 'react-native';

const Divider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'gray',
    marginVertical: 13,
  },
});

export default Divider;
