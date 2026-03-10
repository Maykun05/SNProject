import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function HomeHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  logo: { width: 120, height: 50 },
  username: { marginTop: 8 },
});
