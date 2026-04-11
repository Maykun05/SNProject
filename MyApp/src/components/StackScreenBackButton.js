import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_TINT = '#1E4D2B';

/**
 * ปุ่มย้อนกลับมุมซ้ายบน สำหรับหน้าที่เปิดจาก Home stack โดยไม่มี header
 */
const H_INSET = 18;
const TOP_BELOW_SAFE = 10;

export default function StackScreenBackButton({ tintColor = DEFAULT_TINT }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const top = Math.max(insets.top, 10) + TOP_BELOW_SAFE;
  const left = H_INSET + Math.max(insets.left, 0);

  const onPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen');
  };

  return (
    <TouchableOpacity
      style={[styles.wrap, { top, left }]}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="กลับ"
      activeOpacity={0.75}
    >
      <Ionicons name="chevron-back" size={26} color={tintColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 200,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
