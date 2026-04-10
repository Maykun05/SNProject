import { View, Text, StyleSheet, Image } from 'react-native';

const CoinBadge = ({ amount, inline = false }) => (
  <View style={[styles.coinBadge, inline && styles.coinBadgeInline]}>
    <Image 
      source={require('../assets/coin.png')}
      style={styles.coinIcon} 
    />
    <Text style={styles.coinText}>{String(amount ?? 0)}</Text>
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
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinText: { fontWeight: '700', fontSize: 15, color: '#C8861A' },
});

export default CoinBadge;