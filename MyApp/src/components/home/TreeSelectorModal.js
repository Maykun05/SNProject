import React from 'react';
import {
  Modal, View, Text, Image, TouchableOpacity,
  StyleSheet, FlatList,
} from 'react-native';
import { TREE_ASSETS } from '../../constants/treeAssets';

export default function TreeSelectorModal({ visible, currentType, onSelect, onClose }) {
  const treeTypes = [1, 2, 3, 4, 5];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>เลือกต้นไม้</Text>

          <FlatList
            data={treeTypes}
            numColumns={3}
            keyExtractor={(item) => String(item)}
            renderItem={({ item: type }) => (
              <TouchableOpacity
                style={[styles.card, currentType === type && styles.cardSelected]}
                onPress={() => onSelect(type)}
              >
                {/* แสดงรูป stage 5 (เต็ม) เป็น preview */}
                <Image source={TREE_ASSETS[type][5]} style={styles.preview} />
                <Text style={styles.label}>แบบ {type}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  card: {
    flex: 1, margin: 8, alignItems: 'center',
    padding: 12, borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0',
  },
  cardSelected: { borderColor: '#4CAF50', backgroundColor: '#F1F8F1' },
  preview: { width: 70, height: 70, resizeMode: 'contain' },
  label: { marginTop: 6, fontSize: 13, color: '#555' },
  closeBtn: {
    marginTop: 16, alignItems: 'center',
    paddingVertical: 12, backgroundColor: '#f5f5f5', borderRadius: 12,
  },
  closeTxt: { fontSize: 15, color: '#555' },
});