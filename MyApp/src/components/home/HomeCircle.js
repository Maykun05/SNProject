// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// export default function HomeCircle({
//   features,
//   doneMap,
//   doneCount,
//   totalCount,
//   treeImage,
//   onPressFeature,
// }) {

//   // ✅ เอาเฉพาะฟีเจอร์ที่ "ยังไม่เสร็จ"
//   const activeFeatures = features.filter(f => !doneMap[f.key]);

//   return (
//     <View style={styles.wrapper}>

//       {/* วงกลมหลัก */}
//       <View style={styles.circle}>
//         <Image source={treeImage} style={styles.image} />
//         <Text style={styles.text}>
//           {doneCount}/{totalCount} เป้าหมาย
//         </Text>
//       </View>

//       {/* 🔥 ไอคอนรอบวง (แก้แล้ว) */}
//       {activeFeatures.map((f, index) => {
//         const radius = 120;     // ระยะจากจุดศูนย์กลาง
//         const center = 130;     // ครึ่งของ wrapper (260 / 2)

//         // ✅ กระจายเท่ากัน + เริ่มจากด้านบน
//         const angle =
//           (2 * Math.PI * index) / activeFeatures.length - Math.PI / 2;

//         const x = radius * Math.cos(angle);
//         const y = radius * Math.sin(angle);

//         return (
//           <TouchableOpacity
//             key={f.key}
//             style={[
//               styles.icon,
//               {
//                 left: center + x - 22, // 22 = ครึ่งของ icon (44)
//                 top: center + y - 22,
//               },
//             ]}
//             onPress={() => onPressFeature(f)}
//           >
//             <MaterialCommunityIcons name={f.icon} size={26} />
//           </TouchableOpacity>
//         );
//       })}

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     alignSelf: 'center',
//     width: 260,
//     height: 260,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },

//   circle: {
//     width: 240,
//     height: 240,
//     borderRadius: 120,
//     borderWidth: 3,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   image: {
//     width: 100,
//     height: 100,
//   },

//   text: {
//     marginTop: 6,
//     fontSize: 15,
//   },

//   icon: {
//     position: 'absolute',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#abb9a7ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },
// });
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// 🔹 Component ย่อยสำหรับแต่ละ icon
function CircleIcon({ f, index, total, onPressFeature }) {
  const circleSize = 240;
  const iconSize = 44;
  const radius = circleSize / 2;
  const center = circleSize / 2;
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;

  const targetX = center + radius * Math.cos(angle) - iconSize / 2;
  const targetY = center + radius * Math.sin(angle) - iconSize / 2;

  const posX = useSharedValue(targetX);
  const posY = useSharedValue(targetY);

  // animate ไปตำแหน่งใหม่เมื่อค่าเปลี่ยน
  useEffect(() => {
    posX.value = withSpring(targetX);
    posY.value = withSpring(targetY);
  }, [targetX, targetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top: posY.value,
  }));

  return (
    <Animated.View style={[styles.icon, animatedStyle]}>
      <MaterialCommunityIcons
        name={f.icon}
        size={26}
        onPress={() => onPressFeature(f)}
      />
    </Animated.View>
  );
}

export default function HomeCircle({
  features,
  doneMap,
  doneCount,
  totalCount,
  treeImage,
  onPressFeature,
}) {
  const activeFeatures = features.filter(f => !doneMap[f.key]);

  return (
    <View style={styles.wrapper}>
      {/* วงกลมหลัก */}
      <View style={styles.circle}>
        <Image source={treeImage} style={styles.image} />
        <Text style={styles.text}>
          {doneCount}/{totalCount} เป้าหมาย
        </Text>
      </View>

      {/* ไอคอนรอบวง */}
      {activeFeatures.map((f, index) => (
        <CircleIcon
          key={f.key}
          f={f}
          index={index}
          total={activeFeatures.length}
          onPressFeature={onPressFeature}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: 100, height: 100 },
  text: { marginTop: 6, fontSize: 15 },
  icon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});