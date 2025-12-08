import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const _layout = () => {
  return (
   
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'index') {
            return (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            );
          }
          if (route.name === 'records') {
            return (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={size}
                color={color}
              />
            );
          }
          if(route.name === 'audio') {
            return (
              <Ionicons
                name={focused ? 'mic' : 'mic-outline'}
                size={size}
                color={color}
              />
            );
          }
          if (route.name === 'profile') {
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            );
          }
          if (route.name === 'ai_agent') {
            return (
              <Ionicons
                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                size={size}
                color={color}
              />
            );
          }
          
          return null;
        },
        tabBarActiveTintColor: '#22C55E',
    tabBarInactiveTintColor: '#9CA3AF',
    tabBarStyle: {
      backgroundColor: '#020617', // tab bar bg
      borderTopColor: '#1F2937',  // top border color
      height: 60, 
    }
      })}
    >
        <Tabs.Screen 
        name="index" 
        options={{ 
            title: 'Home', 
            headerShown: false 
        }} />
        <Tabs.Screen 
        name="records" 
        options={{ 
            title: 'records', 
            headerShown: false 
        }} />
        <Tabs.Screen 
        name="audio" 
        options={{ 
            title: 'Audio Assistant', 
            headerShown: false 
        }} />
        <Tabs.Screen 
        name="profile" 
        options={{ 
            title: 'Profile', 
            headerShown: false 
        }} />
        <Tabs.Screen
        name="ai_agent"
        options={{
            title: 'Chatbot',
            headerShown: false
        }} />
    </Tabs>
   
  )
}

export default _layout

const styles = StyleSheet.create({})