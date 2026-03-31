import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Homepage from '../screen/homepage';
import HomeStackNavigator from './HomeStackNavigator';
import CalendarScreen from '../screen/CalendarScreen';
import BMIScreen from '../screen/BMIScreen';
import MissionScreen from '../screen/MissionScreen';

const Tab = createBottomTabNavigator();

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
            case 'Home':
              iconName = 'home';
              label = 'หน้าหลัก';
              break;
            case 'Calendar':
              iconName = 'calendar';
              label = 'ปฏิทิน';
              break;
            case 'BMI':
              iconName = 'body';
              label = 'BMI';
              break;
            case 'Stats':
              iconName = 'stats-chart';
              label = 'สถิติ';
              break;
            case 'Mission':
              iconName = 'person';
              label = 'ภารกิจ';
              break;
          }

          return (
            <View style={[styles.tabItem, focused && styles.activeTab]}>
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? '#2E7D5B' : '#000'}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: focused ? '#2E7D5B' : '#000' },
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
        name="Home"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="BMI" component={BMIScreen} />
      <Tab.Screen name="Stats" component={Homepage} />
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
    backgroundColor: '#2E7D5B',
    borderTopWidth: 0,
    elevation: 8,
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
