import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#1E4D2B';

const ProfileAccountCard = ({ email, onPressEmail, onPressPassword }) => (
  <View style={[styles.cardHalf, { flex: 1 }]}>
    <View style={styles.cardHeaderIndicator} />
    <TouchableOpacity style={styles.accountRow} onPress={onPressEmail}>
      <View style={styles.accountRowLeft}>
        <Text style={styles.label}>อีเมล</Text>
        <Text style={styles.value} numberOfLines={1}>{email || '-'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
    <View style={styles.divider} />
    <TouchableOpacity style={styles.accountRow} onPress={onPressPassword}>
      <View style={styles.accountRowLeft}>
        <Text style={styles.label}>รหัสผ่าน</Text>
        <Text style={styles.value}>••••••••</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  cardHalf: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeaderIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: GREEN,
  },
  label: { fontSize: 10, color: '#999' },
  value: { fontSize: 12, fontWeight: '500', marginTop: 2, marginBottom: 4, color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountRowLeft: { flex: 1, paddingRight: 10 },
});

export default ProfileAccountCard;
