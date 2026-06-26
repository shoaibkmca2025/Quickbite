import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface NavigationWrapperProps {
  children: React.ReactNode;
  activeKey: string;
}

const AnimatedView = Animated.View as any;

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  children,
  activeKey,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activeKey]);

  return (
    <AnimatedView style={[styles.container, { opacity: fadeAnim }]}>
      {children}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
