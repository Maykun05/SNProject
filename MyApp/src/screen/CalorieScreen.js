import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Food Database ─────────────────────────────────────────────────────────────
const FOOD_DATABASE = [
  { id: '1',  name: 'ข้าวผัด',       icon: '🍳', kcal: 400, category: 'อาหารจานหลัก' },
  { id: '2',  name: 'ข้าวมันไก่',    icon: '🍗', kcal: 500, category: 'อาหารจานหลัก' },
  { id: '3',  name: 'ผัดไทย',        icon: '🍜', kcal: 350, category: 'อาหารจานหลัก' },
  { id: '4',  name: 'ส้มตำ',         icon: '🥗', kcal: 150, category: 'อาหารเบา' },
  { id: '5',  name: 'ต้มยำกุ้ง',    icon: '🍲', kcal: 200, category: 'ซุป' },
  { id: '6',  name: 'ผัดกะเพรา',    icon: '🥘', kcal: 430, category: 'อาหารจานหลัก' },
  { id: '7',  name: 'ข้าวหน้าเป็ด', icon: '🍱', kcal: 480, category: 'อาหารจานหลัก' },
  { id: '8',  name: 'แกงเขียวหวาน', icon: '🥣', kcal: 370, category: 'แกง' },
  { id: '9',  name: 'ราดหน้า',       icon: '🍝', kcal: 410, category: 'อาหารจานหลัก' },
  { id: '10', name: 'ลาบหมู',        icon: '🥩', kcal: 290, category: 'อาหารจานหลัก' },
  { id: '11', name: 'ข้าวต้ม',       icon: '🥣', kcal: 180, category: 'อาหารเบา' },
  { id: '12', name: 'บะหมี่น้ำ',     icon: '🍜', kcal: 320, category: 'อาหารจานหลัก' },
  { id: '13', name: 'สุกี้',         icon: '🫕', kcal: 380, category: 'อาหารจานหลัก' },
  { id: '14', name: 'หมูกระทะ',      icon: '🥓', kcal: 600, category: 'อาหารจานหลัก' },
  { id: '15', name: 'น้ำส้มคั้น',   icon: '🍊', kcal: 110, category: 'เครื่องดื่ม' },
  { id: '16', name: 'กาแฟ',          icon: '☕', kcal: 80,  category: 'เครื่องดื่ม' },
  { id: '17', name: 'โยเกิร์ต',      icon: '🍶', kcal: 150, category: 'ของว่าง' },
  { id: '18', name: 'ผลไม้รวม',      icon: '🍇', kcal: 120, category: 'ของว่าง' },
  { id: '19', name: 'ไข่ดาว',        icon: '🍳', kcal: 90,  category: 'ของว่าง' },
  { id: '20', name: 'ข้าวเหนียวมะม่วง', icon: '🥭', kcal: 380, category: 'ของหวาน' },
  { id: '21', name: 'ไอศกรีม',       icon: '🍦', kcal: 200, category: 'ของหวาน' },
  { id: '22', name: 'ขนมปัง',        icon: '🍞', kcal: 150, category: 'ของว่าง' },
  { id: '23', name: 'สลัดผัก',       icon: '🥙', kcal: 80,  category: 'อาหารเบา' },
  { id: '24', name: 'ซีเรียล',       icon: '🥣', kcal: 250, category: 'ของว่าง' },
];

const QUICK_FOODS = FOOD_DATABASE.slice(0, 4);

// ─── BMR / TDEE ────────────────────────────────────────────────────────────────
const ACTIVITY_FACTORS = {
  none:     { label: 'ไม่ได้ออกกำลังกาย',                    factor: 1.2   },
  light:    { label: 'ออกกำลังกายเบา (1-3 วัน/สัปดาห์)',    factor: 1.375 },
  moderate: { label: 'ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)', factor: 1.55  },
  heavy:    { label: 'ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)',   factor: 1.725 },
};

const GOAL_OPTIONS = {
  maintain: { label: 'รักษาน้ำหนัก', offset: 0,    color: '#22c55e' },
  lose:     { label: 'ลดน้ำหนัก',    offset: -400, color: '#f59e0b' },
  gain:     { label: 'เพิ่มน้ำหนัก', offset: 400,  color: '#3b82f6' },
};

function calcBMR({ gender, weight, height, age }) {
  if (gender === 'male') {
    return Math.round(88.36 + 13.4 * weight + 4.8 * height - 5.7 * age);
  }
  return Math.round(447.6 + 9.2 * weight + 3.1 * height - 4.3 * age);
}

function calcTDEE(bmr, activityKey) {
  return Math.round(bmr * (ACTIVITY_FACTORS[activityKey]?.factor ?? 1.2));
}

function calcGoalKcal(tdee, goalKey) {
  return tdee + (GOAL_OPTIONS[goalKey]?.offset ?? 0);
}

// ─── Semi-circle ring ──────────────────────────────────────────────────────────
function CalorieRing({ eaten, target }) {
  const R = 90;
  const CX = 110;
  const CY = 110;
  const pct = Math.min(1, eaten / Math.max(1, target));

  function describeArc(startAngle, endAngle) {
    const toRad = (a) => (a * Math.PI) / 180;
    const x1 = CX + R * Math.cos(toRad(startAngle));
    const y1 = CY + R * Math.sin(toRad(startAngle));
    const x2 = CX + R * Math.cos(toRad(endAngle));
    const y2 = CY + R * Math.sin(toRad(endAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  }

  const startAngle = 180;
  const fullEndAngle = 0; // 180° sweep
  const fillEnd = startAngle + pct * 180;

  return (
    <View style={styles.ringContainer}>
      <Svg width={220} height={120} viewBox="0 0 220 120">
        {/* Background arc */}
        <Path
          d={describeArc(180, 360)}
          stroke="#e5e7eb"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        {/* Fill arc */}
        {pct > 0 && (
          <Path
            d={describeArc(180, fillEnd)}
            stroke="#22c55e"
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={styles.ringTextOverlay}>
        <Text style={styles.ringKcalNum}>{eaten}</Text>
        <Text style={styles.ringKcalLabel}>kcal</Text>
        <Text style={styles.ringTarget}>จาก {target}</Text>
      </View>
    </View>
  );
}

// ─── Setup Modal (BMR/TDEE) ────────────────────────────────────────────────────
function SetupModal({ visible, profile, onSave, onClose }) {
  const [gender,   setGender]   = useState(profile?.gender   ?? 'female');
  const [weight,   setWeight]   = useState(String(profile?.weight   ?? 50));
  const [height,   setHeight]   = useState(String(profile?.height   ?? 160));
  const [age,      setAge]      = useState(String(profile?.age      ?? 30));
  const [activity, setActivity] = useState(profile?.activity ?? 'light');
  const [goal,     setGoal]     = useState(profile?.goal     ?? 'maintain');

  useEffect(() => {
    if (visible && profile) {
      setGender(profile.gender);
      setWeight(String(profile.weight));
      setHeight(String(profile.height));
      setAge(String(profile.age));
      setActivity(profile.activity);
      setGoal(profile.goal);
    }
  }, [visible]);

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseInt(age, 10)  || 0;
  const bmr  = w && h && a ? calcBMR({ gender, weight: w, height: h, age: a }) : null;
  const tdee = bmr ? calcTDEE(bmr, activity) : null;
  const goal_kcal = tdee ? calcGoalKcal(tdee, goal) : null;

  function handleSave() {
    if (!w || !h || !a) {
      Alert.alert('กรอกข้อมูลให้ครบ', 'กรุณากรอก น้ำหนัก ส่วนสูง และอายุ');
      return;
    }
    onSave({ gender, weight: w, height: h, age: a, activity, goal, bmr, tdee, goalKcal: goal_kcal });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>ตั้งค่าข้อมูลส่วนตัว</Text>

          {/* Gender */}
          <Text style={styles.fieldLabel}>เพศ</Text>
          <View style={styles.segmentRow}>
            {[['female', '👩 ผู้หญิง'], ['male', '👨 ผู้ชาย']].map(([v, l]) => (
              <TouchableOpacity
                key={v}
                style={[styles.segBtn, gender === v && styles.segBtnActive]}
                onPress={() => setGender(v)}>
                <Text style={[styles.segBtnText, gender === v && styles.segBtnTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight / Height / Age */}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>น้ำหนัก (กก.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="50" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>ส่วนสูง (ซม.)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder="160" />
            </View>
          </View>
          <Text style={styles.fieldLabel}>อายุ (ปี)</Text>
          <TextInput style={[styles.input, { marginBottom: 12 }]} keyboardType="numeric" value={age} onChangeText={setAge} placeholder="30" />

          {/* Activity */}
          <Text style={styles.fieldLabel}>ระดับการออกกำลังกาย</Text>
          {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
            <TouchableOpacity
              key={k}
              style={[styles.radioRow, activity === k && styles.radioRowActive]}
              onPress={() => setActivity(k)}>
              <View style={[styles.radioCircle, activity === k && styles.radioCircleActive]} />
              <Text style={styles.radioLabel}>{v.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Goal */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>เป้าหมาย</Text>
          <View style={styles.segmentRow}>
            {Object.entries(GOAL_OPTIONS).map(([k, v]) => (
              <TouchableOpacity
                key={k}
                style={[styles.segBtn, { flex: 1 }, goal === k && { backgroundColor: v.color, borderColor: v.color }]}
                onPress={() => setGoal(k)}>
                <Text style={[styles.segBtnText, goal === k && { color: '#fff' }]}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          {bmr != null && (
            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>BMR</Text>
                <Text style={styles.previewVal}>{bmr} kcal/วัน</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewKey}>TDEE</Text>
                <Text style={styles.previewVal}>{tdee} kcal/วัน</Text>
              </View>
              <View style={[styles.previewRow, { marginBottom: 0 }]}>
                <Text style={styles.previewKey}>เป้าหมาย ({GOAL_OPTIONS[goal].label})</Text>
                <Text style={[styles.previewVal, { color: GOAL_OPTIONS[goal].color }]}>{goal_kcal} kcal/วัน</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>บันทึก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Food Search Modal ─────────────────────────────────────────────────────────
function FoodSearchModal({ visible, onAdd, onClose }) {
  const [query, setQuery]         = useState('');
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  const results = query
    ? FOOD_DATABASE.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase())
      )
    : FOOD_DATABASE.slice(0, 8);

  function handleAddCustom() {
    if (!customName || !customKcal) return;
    onAdd({ id: `custom-${Date.now()}`, name: customName, icon: '🍽', kcal: parseInt(customKcal, 10) || 0 });
    setCustomName('');
    setCustomKcal('');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
        <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>ค้นหาอาหาร</Text>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="ค้นหาชื่ออาหาร..."
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ fontSize: 16, color: '#aaa', paddingHorizontal: 8 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={item => item.id}
            style={{ maxHeight: 260 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.foodResultRow} onPress={() => onAdd(item)}>
                <Text style={styles.foodResultIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodResultName}>{item.name}</Text>
                  <Text style={styles.foodResultCat}>{item.category}</Text>
                </View>
                <Text style={styles.foodResultKcal}>{item.kcal} kcal</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>ไม่พบ "{query}"</Text>
            }
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>เพิ่มอาหารเอง</Text>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <TextInput style={styles.input} placeholder="ชื่ออาหาร" value={customName} onChangeText={setCustomName} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput style={styles.input} placeholder="kcal" keyboardType="numeric" value={customKcal} onChangeText={setCustomKcal} />
            </View>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddCustom}>
            <Text style={styles.saveBtnText}>เพิ่มอาหาร</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CalorieScreen({ navigation, route }) {
  const [profile,    setProfile]    = useState(null);
  const [foodLog,    setFoodLog]    = useState([
    { id: 'init-1', name: 'ข้าวผัด', icon: '🍳', kcal: 400, time: '18:02' },
  ]);
  const [showSetup,  setShowSetup]  = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const target = profile?.goalKcal ?? 2000;
  const eaten  = foodLog.reduce((s, f) => s + f.kcal, 0);
  const left   = Math.max(0, target - eaten);
  const goalLabel = profile ? GOAL_OPTIONS[profile.goal]?.label : 'รักษาน้ำหนัก';
  const goalColor = profile ? GOAL_OPTIONS[profile.goal]?.color : '#22c55e';

  function getTime() {
    return new Date().toTimeString().slice(0, 5);
  }

  function handleAddFood(food) {
    setFoodLog(prev => [...prev, { ...food, id: `log-${Date.now()}`, time: getTime() }]);
    setShowSearch(false);
  }

  function handleRemoveFood(id) {
    setFoodLog(prev => prev.filter(f => f.id !== id));
  }

  function handleSaveProfile(p) {
    setProfile(p);
    setShowSetup(false);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>แคลอรี่วันนี้</Text>
        <Text style={[styles.headerGoal, { color: goalColor }]}>{goalLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Ring */}
        <CalorieRing eaten={eaten} target={target} />

        {/* Stats badges */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statText}>{eaten} กิน</Text>
          </View>
          <View style={[styles.statBadge, styles.statBadgeGreen]}>
            <Text style={styles.statCheckmark}>✔</Text>
            <Text style={[styles.statText, { color: '#15803d' }]}>เหลือ {left} kcal</Text>
          </View>
        </View>

        {/* BMR/TDEE info or setup button */}
        {profile ? (
          <View style={styles.tdeeCard}>
            <View style={styles.tdeeRow}>
              <Text style={styles.tdeeKey}>BMR</Text>
              <Text style={styles.tdeeVal}>{profile.bmr} kcal</Text>
            </View>
            <View style={styles.tdeeRow}>
              <Text style={styles.tdeeKey}>TDEE</Text>
              <Text style={styles.tdeeVal}>{profile.tdee} kcal</Text>
            </View>
            <View style={[styles.tdeeRow, { marginBottom: 0 }]}>
              <Text style={styles.tdeeKey}>เป้าหมาย</Text>
              <Text style={[styles.tdeeVal, { color: goalColor, fontWeight: '700' }]}>{profile.goalKcal} kcal/วัน</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSetup(true)} style={styles.editLink}>
              <Text style={styles.editLinkText}>แก้ไขข้อมูล</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.setupBtn} onPress={() => setShowSetup(true)}>
            <Text style={styles.setupBtnText}>ตั้งค่าข้อมูลส่วนตัว (คำนวณ BMR/TDEE)</Text>
          </TouchableOpacity>
        )}

        {/* Quick add */}
        <Text style={styles.sectionTitle}>เพิ่มด่วน</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
          {QUICK_FOODS.map(f => (
            <TouchableOpacity key={f.id} style={styles.quickCard} onPress={() => handleAddFood(f)}>
              <Text style={styles.quickIcon}>{f.icon}</Text>
              <Text style={styles.quickName}>{f.name}</Text>
              <Text style={styles.quickKcal}>{f.kcal} kcal</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's log */}
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>รายการวันนี้</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowSearch(true)}>
            <Text style={styles.addBtnText}>+ เพิ่ม</Text>
          </TouchableOpacity>
        </View>

        {foodLog.length === 0 ? (
          <Text style={styles.emptyLog}>ยังไม่มีรายการ</Text>
        ) : (
          foodLog.map(f => (
            <View key={f.id} style={styles.logRow}>
              <View style={styles.logDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.logName}>{f.icon} {f.name}</Text>
                <Text style={styles.logTime}>{f.time}</Text>
              </View>
              <Text style={styles.logKcal}>{f.kcal} kcal</Text>
              <TouchableOpacity onPress={() => handleRemoveFood(f.id)} style={styles.delBtn}>
                <Text style={styles.delBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modals */}
      <SetupModal
        visible={showSetup}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setShowSetup(false)}
      />
      <FoodSearchModal
        visible={showSearch}
        onAdd={handleAddFood}
        onClose={() => setShowSearch(false)}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const GREEN = '#22c55e';
const GREEN_LIGHT = '#dcfce7';
const GRAY_BG = '#f3f4f6';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6b7280';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  headerGoal: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Ring
  ringContainer: {
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  ringTextOverlay: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
  },
  ringKcalNum: {
    fontSize: 36,
    fontWeight: '800',
    color: GREEN,
    lineHeight: 40,
  },
  ringKcalLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  ringTarget: {
    fontSize: 11,
    color: '#9ca3af',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 4,
  },
  statBadgeGreen: {
    backgroundColor: GREEN_LIGHT,
  },
  statIcon: { fontSize: 15 },
  statCheckmark: { fontSize: 13, color: '#15803d', fontWeight: '700' },
  statText: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: '500' },

  // Setup / TDEE
  setupBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  setupBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tdeeCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  tdeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tdeeKey: { fontSize: 13, color: TEXT_SECONDARY },
  tdeeVal: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: '600' },
  editLink: { alignItems: 'flex-end', marginTop: 4 },
  editLinkText: { fontSize: 12, color: GREEN, fontWeight: '600' },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },

  // Quick cards
  quickScroll: { marginBottom: 20 },
  quickCard: {
    backgroundColor: GRAY_BG,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    width: 82,
  },
  quickIcon: { fontSize: 26, marginBottom: 4 },
  quickName: { fontSize: 12, color: TEXT_PRIMARY, fontWeight: '500', textAlign: 'center' },
  quickKcal: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 },

  // Log
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: GREEN,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginRight: 10,
  },
  logName: { fontSize: 14, fontWeight: '500', color: TEXT_PRIMARY },
  logTime: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  logKcal: { fontSize: 14, fontWeight: '700', color: GREEN, marginRight: 8 },
  delBtn: { padding: 4 },
  delBtnText: { color: '#d1d5db', fontSize: 16 },
  emptyLog: { textAlign: 'center', color: '#d1d5db', fontSize: 13, paddingVertical: 20 },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 6,
    fontWeight: '500',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  segBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  segBtnText: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: '500' },
  segBtnTextActive: { color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputGroup: { flex: 1 },
  input: {
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: TEXT_PRIMARY,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#fafafa',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  radioRowActive: {
    backgroundColor: '#f0fdf4',
    borderColor: GREEN,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  radioLabel: { fontSize: 13, color: TEXT_PRIMARY },
  previewBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewKey: { fontSize: 13, color: TEXT_SECONDARY },
  previewVal: { fontSize: 13, fontWeight: '700', color: TEXT_PRIMARY },
  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: GRAY_BG,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: { color: TEXT_SECONDARY, fontSize: 14 },

  // Food search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_BG,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 4 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  foodResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  foodResultIcon: { fontSize: 22, marginRight: 10 },
  foodResultName: { fontSize: 14, fontWeight: '500', color: TEXT_PRIMARY },
  foodResultCat: { fontSize: 11, color: TEXT_SECONDARY },
  foodResultKcal: { fontSize: 13, fontWeight: '700', color: GREEN },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 16 },
  divider: { height: 0.5, backgroundColor: '#e5e7eb', marginVertical: 12 },
});