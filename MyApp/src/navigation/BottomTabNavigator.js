import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Homepage from '../screen/homepage';
import HomeStackNavigator from './HomeStackNavigator';
import CalendarScreen from '../screen/CalendarScreen';
import BMIScreen from '../screen/BMIScreen';
import MissionScreen from '../screen/MissionScreen';
import FeatureStatsScreen from '../screen/FeatureStatsScreen.js';

const Tab = createBottomTabNavigator();

/** โทนเดียวกับ ProfileScreen / ProfileScreen.README.md */
const GREEN = '#1E4D2B';
const TAB_INACTIVE = 'rgba(255, 255, 255, 0.78)';

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { flex: 1 }, // สำคัญมาก

        tabBarIcon: ({ focused }) => {
          let iconName;
          let label;

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              label = 'หน้าหลัก';
              break;
            case 'Calendar':
              iconName = 'calendar';
              label = 'ปฏิทิน';
              break;
            case 'BMI':
              iconName = 'body';
              label = 'ดัชนีมวลกาย';
              break;
            case 'Stats':
              iconName = 'stats-chart';
              label = 'สถิติ';
              break;
            case 'Mission':
              iconName = 'trophy';
              label = 'ภารกิจ';
              break;
          }

          return (
            <View style={[styles.tabItem, focused && styles.activeTab]}>
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? GREEN : TAB_INACTIVE}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: focused ? GREEN : TAB_INACTIVE },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="BMI" component={BMIScreen} />
      <Tab.Screen name="Stats" component={FeatureStatsScreen} />
      <Tab.Screen name="Mission" component={MissionScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    marginHorizontal: 24,
    alignSelf: 'center',
    bottom: 30,
    left: 32,
    right: 32,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: GREEN,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },

  tabItem: {
    width: 64,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  activeTab: {
    backgroundColor: '#fff',
  },

  tabText: {
    fontSize: 10,
    marginTop: 2,
  },
});
