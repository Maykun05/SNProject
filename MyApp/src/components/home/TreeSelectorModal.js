import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TREE_ASSETS } from '../../constants/treeAssets';
import { API_URL } from '../../config';

const API_BASE = `${API_URL}/api`;

const FALLBACK_COSTS = { 2: 200, 3: 350, 4: 500, 5: 700 };

function buildFallbackCatalog() {
  return [1, 2, 3, 4, 5].map((id) => ({
    id,
    key: `type${id}`,
    displayName: `แบบ ${id}`,
    unlockCoinCost: id === 1 ? 0 : FALLBACK_COSTS[id] ?? 0,
    sortOrder: id,
    unlocked: id === 1,
  }));
}

export default function TreeSelectorModal({ visible, currentType, onSelect, onClose, onCoinsUpdated }) {
  const [catalog, setCatalog] = useState(buildFallbackCatalog());
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setCatalog(buildFallbackCatalog());
        setCoins(0);
        return;
      }
      const res = await fetch(`${API_BASE}/home-trees/trees/catalog`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json().catch(() => ({}));
      const types = json.data?.treeTypes;
      const hasTypes = Array.isArray(types) && types.length > 0;
      if (res.ok && json.success && hasTypes) {
        setCatalog(types);
        setCoins(typeof json.data.coins === 'number' ? json.data.coins : 0);
      } else {
        setCatalog(buildFallbackCatalog());
        setCoins(typeof json.data?.coins === 'number' ? json.data.coins : 0);
      }
    } catch (e) {
      console.error('TreeSelectorModal catalog:', e);
      setCatalog(buildFallbackCatalog());
      setCoins(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadCatalog();
    }
  }, [visible, loadCatalog]);

  const handleUnlock = async (item) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('เข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบเพื่อใช้เหรียญปลดล็อกต้นไม้');
      return;
    }
    if (item.unlockCoinCost <= 0) return;
    if (coins < item.unlockCoinCost) {
      Alert.alert('เหรียญไม่พอ', `ต้องการ ${item.unlockCoinCost} เหรียญ (คุณมี ${coins})`);
      return;
    }

    Alert.alert(
      'ปลดล็อกต้นไม้',
      `ใช้ ${item.unlockCoinCost} เหรียญ เพื่อปลดล็อก "${item.displayName || `แบบ ${item.id}`}"?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ซื้อ',
          onPress: async () => {
            setUnlockingId(item.id);
            try {
              const res = await fetch(`${API_BASE}/home-trees/trees/unlock`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ treeTypeId: item.id }),
              });
              const json = await res.json().catch(() => ({}));
              if (res.ok && json.success) {
                const next = typeof json.data?.coins === 'number' ? json.data.coins : coins - item.unlockCoinCost;
                setCoins(next);
                onCoinsUpdated?.(next);
                setCatalog((prev) =>
                  prev.map((t) => (t.id === item.id ? { ...t, unlocked: true } : t))
                );
              } else {
                Alert.alert('ไม่สำเร็จ', json.message || 'ปลดล็อกไม่ได้');
              }
            } catch (e) {
              Alert.alert('ข้อผิดพลาด', String(e.message || e));
            } finally {
              setUnlockingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const type = Number(item.id);
    if (!TREE_ASSETS[type]?.[5]) {
      return null;
    }
    const unlocked = Boolean(item.unlocked);
    const cost = item.unlockCoinCost ?? 0;
    const isBusy = unlockingId === type;

    if (unlocked) {
      return (
        <TouchableOpacity
          style={[styles.card, currentType === type && styles.cardSelected]}
          onPress={() => onSelect(type)}
          activeOpacity={0.85}
        >
          <Image source={TREE_ASSETS[type][5]} style={styles.preview} />
          <Text style={styles.label}>{item.displayName || `แบบ ${type}`}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.lockedInner}>
          <Image source={TREE_ASSETS[type][5]} style={[styles.preview, styles.previewDim]} />
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={22} color="#fff" />
          </View>
        </View>
        <Text style={styles.labelMuted}>{item.displayName || `แบบ ${type}`}</Text>
        <View style={styles.priceRow}>
          <Image source={require('../../assets/coin.png')} style={styles.coinTiny} />
          <Text style={styles.priceText}>{cost}</Text>
        </View>
        <TouchableOpacity
          style={[styles.unlockBtn, (coins < cost || isBusy) && styles.unlockBtnDisabled]}
          onPress={() => handleUnlock(item)}
          disabled={isBusy || cost <= 0}
        >
          {isBusy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.unlockBtnText}>ปลดล็อก</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  let sorted = [...catalog].sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
  if (sorted.length === 0) {
    sorted = buildFallbackCatalog();
  }

  const { width: winW } = Dimensions.get('window');
  const gridPad = 48;
  const colGap = 12;
  const cardW = Math.floor((winW - gridPad - colGap * 2) / 3);

  const rows = [];
  for (let i = 0; i < sorted.length; i += 3) {
    rows.push(sorted.slice(i, i + 3));
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerBar}>
            <View style={styles.headerSide} />
            <Text style={styles.title}>เลือกต้นไม้</Text>
            <View style={styles.coinsPill}>
              <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
              <Text style={styles.coinsText}>{loading ? '…' : coins}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : (
            <ScrollView
              style={styles.gridScroll}
              contentContainerStyle={styles.gridContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={sorted.length > 6}
            >
              {rows.map((row, ri) => (
                <View key={`row-${ri}`} style={styles.gridRow}>
                  {row.map((item, ci) => (
                    <View
                      key={item.id}
                      style={[
                        styles.gridCell,
                        { width: cardW, marginRight: ci < row.length - 1 ? colGap : 0 },
                      ]}
                    >
                      {renderItem({ item })}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '88%',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerSide: {
    width: 88,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 88,
    justifyContent: 'flex-end',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0A3',
  },
  coinIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 6,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B8860B',
  },
  loaderWrap: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScroll: {
    maxHeight: 420,
    minHeight: 260,
  },
  gridContent: {
    paddingBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  gridCell: {
    alignItems: 'stretch',
  },
  card: {
    marginVertical: 6,
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  cardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F1',
    width: 120,
    height: 180,
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D0D0D0',
  },
  lockedInner: {
    position: 'relative',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  previewDim: {
    opacity: 0.35,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
  },
  label: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  labelMuted: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinTiny: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C9A227',
  },
  unlockBtn: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  unlockBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  unlockBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  closeTxt: {
    fontSize: 15,
    color: '#555',
  },
});
