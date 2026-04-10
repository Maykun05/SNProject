import { View, Text, StyleSheet, Image } from 'react-native';

const CoinBadge = ({ amount, inline = false, compact = false }) => (
  <View
    style={[
      styles.coinBadge,
      inline && styles.coinBadgeInline,
      compact && styles.coinBadgeCompact,
    ]}
  >
    <Image
      source={require('../assets/coin.png')}
      style={[styles.coinIcon, compact && styles.coinIconCompact]}
    />
    <Text style={[styles.coinText, compact && styles.coinTextCompact]}>
      {String(amount ?? 0)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  coinBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 3, gap: 4,
  },
  coinBadgeInline: {
    position: 'relative',
    top: 0,
    right: 0,
    alignSelf: 'center',
  },
  coinBadgeCompact: {
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 14,
    elevation: 2,
    shadowOpacity: 0.1,
    gap: 3,
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinIconCompact: { width: 17, height: 17 },
  coinText: { fontWeight: '700', fontSize: 15, color: '#C8861A' },
  coinTextCompact: { fontSize: 13 },
});

export default CoinBadge;