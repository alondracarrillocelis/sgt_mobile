import { Tabs } from 'expo-router';
import {
  Home,
  Users,
  ClipboardList,
  CheckSquare,
  Calendar,
  User,
  ChevronDown,
} from 'lucide-react-native';
import { View, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

function AnimatedIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.12 : 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.iconBubble,
        focused && styles.activeBubble,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#999',
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <Home size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clientes',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <Users size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Órdenes',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <ClipboardList size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tareas',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <CheckSquare size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendario',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <Calendar size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon focused={focused}>
                <ChevronDown size={21} color={focused ? '#fff' : '#555'} />
              </AnimatedIcon>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD84A',
  },
  tabBar: {
    position: 'absolute',
    bottom: 15,
    left: 10,
    right: 10,
    height: 68, 
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    paddingVertical: 4, 
  },
  iconBubble: {
    width: 40, 
    height: 40,
    borderRadius: 22,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: -9, 
  },
  activeBubble: {
    backgroundColor: '#3C8BF2',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 13, 
    color: '#333',
  },
});
