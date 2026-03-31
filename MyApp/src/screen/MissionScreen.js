import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MissionScreen = () => {
  
  // คอมโพเนนต์ย่อยสำหรับภารกิจแต่ละใบ
  const MissionCard = ({ title, subtitle, progress, total, timeLeft, color, iconName }) => (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
            {/* ในตัวอย่างเป็นรูปวาด แนะนำให้ใช้ Image source={...} */}
            <View style={[styles.mockIcon, { backgroundColor: color + '22' }]}>
                <Text style={{fontSize: 24}}>📅</Text> 
            </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.timeText, { color: color }]}>🕒 {timeLeft}</Text>
          </View>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(progress/total)*100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressValue}>{progress} / {total}</Text>
        </View>
        <Text style={styles.arrow}>〉</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSmall}>ภารกิจ</Text>
          </View>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' }} // เปลี่ยนเป็นรูปตัวละครของคุณ
            style={styles.characterImg} 
          />
        </View>

        {/* Monthly Mission Card (Green Gradient) */}
        <LinearGradient 
          colors={['#4CAF50', '#2E7D5B']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
          style={styles.monthlyCard}
        >
          <View style={styles.monthlyInfo}>
            <View style={styles.calendarIconBg}>
                <Text style={{fontSize: 20}}>📅</Text>
            </View>
            <Text style={styles.monthlyTitle}>ภารกิจประจำเดือนเมษายน</Text>
            <Text style={styles.arrowWhite}>〉</Text>
          </View>
          <View style={styles.monthlyBadge}>
            <Text style={styles.monthlyBadgeText}>🕒 16 วันเหลือ</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>ภารกิจทั้งหมด ✨</Text>

        {/* Mission List */}
        <MissionCard 
          title="ภารกิจประจำสัปดาห์" 
          subtitle="สะสมครบ 20 แต้มภารกิจ" 
          progress={12} 
          total={20} 
          timeLeft="เหลืออีก 3 วัน" 
          color="#FF9800"
        />

        <MissionCard 
          title="ภารกิจประจำวัน" 
          subtitle="เรียนให้ครบ 3 ชม.เพื่อแกะสลักรูปปั้น" 
          progress={0} 
          total={3} 
          timeLeft="เหลือเวลา 13 ชั่วโมง" 
          color="#4CAF50"
        />

        <View style={styles.dailyTaskContainer}>
            <View style={styles.dailyHeader}>
                <Text style={styles.cardTitle}>ความต่อเนื่อง</Text>
                <Text style={styles.timeTextGreen}>🔥 3 วัน</Text>
            </View>
            <View style={styles.stepContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={[styles.stepDot, i <= 3 ? styles.stepActive : null]} />
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  headerSmall: { fontSize: 32, fontWeight: '800', color: '#2E7D5B', opacity: 0.8 },
  headerLarge: { fontSize: 48, fontWeight: 'bold', color: '#1B4332', marginTop: -10 },
  characterImg: { width: 100, height: 100, borderRadius: 50 },
  
  monthlyCard: { margin: 20, borderRadius: 25, padding: 20, elevation: 5 },
  monthlyInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarIconBg: { backgroundColor: '#fff', padding: 8, borderRadius: 12 },
  monthlyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 15 },
  monthlyBadge: { backgroundColor: '#ffffff44', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginTop: 10, marginLeft: 50 },
  monthlyBadgeText: { color: '#fff', fontSize: 12 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 25, marginBottom: 15, color: '#1B4332' },
  
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 20, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  accentBar: { width: 6 },
  cardContent: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconContainer: { marginRight: 15 },
  mockIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  cardSubtitle: { fontSize: 13, color: '#666', marginVertical: 4 },
  timeText: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, marginTop: 8 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressValue: { fontSize: 12, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  arrow: { fontSize: 20, color: '#CCC', marginLeft: 10 },
  arrowWhite: { fontSize: 20, color: '#FFF' },

  dailyTaskContainer: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 2 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeTextGreen: { color: '#4CAF50', fontWeight: 'bold' },
  stepContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepDot: { width: 15, height: 15, borderRadius: 10, backgroundColor: '#EEE' },
  stepActive: { backgroundColor: '#4CAF50', width: 20, height: 20 }
});

export default MissionScreen;