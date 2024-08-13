import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Button } from 'react-native'
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

export default function Detect_fall() {

    let x: number,y: number,z: number
    let previousX = 0;
    let previousY = 0;
    let previousZ = 0;
    let previousTime = 0;

    const [accelerometerData, setAccelerometerData] = useState({
        x: 0,
        y: 0,
        z: 0,
      });
    
      const [gyroscopeData, setGyroscopeData] = useState({
        x: 0,
        y: 0,
        z: 0,
      });
    
      const [isFallDetectionActive, setIsFallDetectionActive] = useState(false);
    
      useEffect(() => {
        if (isFallDetectionActive) {
          _subscribe();
        } else {
          _unsubscribe();
        }
      }, [isFallDetectionActive]);
    
      const _subscribe = () => {
        console.log('called')
        Accelerometer.addListener((data) => {
            x=data.x
            y=data.y
            z=data.z
          setAccelerometerData(data);
          detectFall();
        });
        Gyroscope.addListener((data) => {
          setGyroscopeData(data);
        });
      };
    
      const _unsubscribe = () => {
        Accelerometer.removeAllListeners();
        Gyroscope.removeAllListeners();
      };

      const schedulePushNotification = async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Fall Detected!',
            body: 'Please check on the user.',
            data: { fallDetected: true },
          },
          trigger: { seconds: 2 },
        });
      };
    
      const detectFall = async () => {
        const currentTime = new Date().getTime();
        console.log(x, y, z)
        
        if (previousTime !== 0) {
            const deltaTime = (currentTime - previousTime) / 1000; // convert to seconds
            const deltaX = x - previousX;
            const deltaY = y - previousY;
            const deltaZ = z - previousZ;
        
            const deltaThreshold = .8; // adjust this value to suit your needs
        
            if (
              (deltaX > deltaThreshold && deltaTime < 0.5) ||
              (deltaY > deltaThreshold && deltaTime < 0.5) ||
              (deltaZ > deltaThreshold && deltaTime < 0.5)
            ) {
              console.log("Fall detected!");
              await schedulePushNotification();
            }
          }
          previousX = x;
          previousY = y;
          previousZ = z;
          previousTime = currentTime;
      };

      const toggleFallDetection = () => {
        setIsFallDetectionActive(!isFallDetectionActive);
      };
    
      return (
        <View>
          <Text>Fall Detection Component</Text>
          <Text>Acceleration: {accelerometerData.x} {accelerometerData.y} {accelerometerData.z}</Text>
          <Text>Gyroscope: {gyroscopeData.x} {gyroscopeData.y} {gyroscopeData.z}</Text>
          <Button
            title={isFallDetectionActive ? 'Deactivate Fall Detection' : 'Activate Fall Detection'}
            onPress={toggleFallDetection}
          />
        </View>
      );
    }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    text: {
      fontSize: 18,
      marginBottom: 20,
    },
    fallInfo: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#f8d7da',
      borderRadius: 5,
    },
    fallText: {
      color: 'red',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });