import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Alert, ScrollView, Image, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { profile, updateProfile, logout } = useProfile();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'กรุณาอนุญาตให้เข้าถึงรูปภาพเพื่อเปลี่ยนโปรไฟล์');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateProfile({ profileImage: result.assets[0].uri });
    }
  };

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ตกลง', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={40} color="#555" />
              </View>
            )}
          </TouchableOpacity>
          {/* ✅ ย้ายข้อความออกมาใต้ circle */}
          <Text style={styles.changePhotoText}>เปลี่ยนรูป</Text>
        </View>

        {/* ── ชื่อ + CoinBadge ── */}
        {/* ✅ ย้าย coinBadge เข้ามาอยู่ใน nameCard และใช้ position relative */}
        <View style={styles.nameCard}>
          <View style={styles.coinBadge}>
            <MaterialCommunityIcons name="gold" size={20} color="#FFD700" />
            <Text style={styles.coinText}>{profile.coins ?? 0}</Text>
          </View>
          <Text style={styles.userNameText}>{profile.name || 'ธนาพล เจริญสุข'}</Text>
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ── Grid: ข้อมูลส่วนตัว & ตั้งค่าเป้าหมาย ── */}
        <View style={styles.gridContainer}>

          {/* ✅ กดได้ → navigate ไปหน้าแก้ไขข้อมูลส่วนตัว */}
          <TouchableOpacity
            style={styles.cardHalf}
            onPress={() => navigation.navigate('EditPersonalInfo')}
          >
            <View style={styles.cardHeaderIndicator} />
            <Text style={styles.cardTitle}>ข้อมูลส่วนตัว</Text>
            <Text style={styles.label}>อีเมล</Text>
            <Text style={styles.value}>{profile.email || '-'}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <Text style={styles.value}>{profile.phone || '-'}</Text>
          </TouchableOpacity>

          {/* ✅ กดได้ → navigate ไปหน้าตั้งค่าเป้าหมาย */}
          <TouchableOpacity
            style={styles.cardHalf}
            onPress={() => navigation.navigate('EditGoals')}
          >
            <View style={[styles.cardHeaderIndicator, { backgroundColor: '#E9DCC9' }]} />
            <Text style={styles.cardTitle}>ตั้งค่าเป้าหมาย</Text>
            <Text style={styles.label}>เป้าหมายก้าวเดินรายวัน</Text>
            <Text style={styles.value}>{profile.goals?.dailyStep ?? 5000} ก้าว</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>เป้าหมายรายสัปดาห์</Text>
            <Text style={styles.value}>{profile.goals?.weeklyStep ?? 15000} ก้าว</Text>
          </TouchableOpacity>

        </View>

        {/* ── ตั้งค่าแอป ── */}
        <View style={styles.cardFull}>
          <View style={styles.cardHeaderIndicator} />
          <Text style={styles.cardTitle}>ตั้งค่าแอป</Text>

          {/* ✅ เพิ่ม vertical divider ระหว่าง option และทำให้กดได้ */}
          <View style={styles.settingOptions}>
            {[
              { label: 'การแจ้งเตือน', screen: 'Notifications' },
              { label: 'ธีม',           screen: 'Theme'         },
              { label: 'ภาษา',          screen: 'Language'      },
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={styles.settingOption}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
                {index < 2 && <View style={styles.verticalDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── นโยบายความเป็นส่วนตัว ── */}
        {/* ✅ เปลี่ยนจาก View → TouchableOpacity ให้กดได้ */}
        <TouchableOpacity
          style={styles.cardFull}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <View style={styles.cardHeaderIndicator} />
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>
            นโยบายความเป็นส่วนตัวและเงื่อนไข
          </Text>
        </TouchableOpacity>

        {/* ── ปุ่ม Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  /* ── Avatar ── */
  avatarSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#1E4D2B',
    overflow: 'hidden',
    backgroundColor: '#E9DCC9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ✅ ย้ายออกมาใต้ avatarContainer
  changePhotoText: {
    fontSize: 13,
    color: '#1E4D2B',
    fontWeight: 'bold',
    marginTop: 8,
  },

  /* ── Name Card ── */
  nameCard: {
    backgroundColor: '#FFF4E6',
    marginHorizontal: 40,
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',   // ✅ รองรับ coinBadge absolute
  },
  userNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  editIcon: {
    padding: 4,
  },
  // ✅ badge มุมขวาบนของ nameCard
  coinBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  coinText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },

  /* ── Grid Cards ── */
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 25,
    justifyContent: 'space-between',
  },
  cardHalf: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardFull: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeaderIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#1E4D2B',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E4D2B',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#888',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },

  /* ── App Settings ── */
  settingOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  // ✅ เส้นแบ่งแนวตั้งระหว่าง option
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },

  /* ── Logout ── */
  logoutBtn: {
    backgroundColor: '#FF6347',
    marginHorizontal: 15,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  logoutBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;