import React, { useRef, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';

interface CustomSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  onSlidingStart?: () => void;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  minimumValue = 0,
  maximumValue = 1,
  onSlidingStart,
  onValueChange,
  onSlidingComplete,
  minimumTrackTintColor = '#FF6B35',
  maximumTrackTintColor = '#333333',
  thumbTintColor = '#FF6B35',
  style,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const isDragging = useRef(false);

  const percentage = useMemo(() => {
    if (maximumValue <= minimumValue || maximumValue === 0) return 0;
    return Math.max(0, Math.min(100, ((value - minimumValue) / (maximumValue - minimumValue)) * 100));
  }, [value, minimumValue, maximumValue]);

  const calculateValue = useCallback((touchX: number) => {
    if (sliderWidth === 0) return value;
    const newPercentage = Math.max(0, Math.min(100, (touchX / sliderWidth) * 100));
    const newValue = minimumValue + (newPercentage / 100) * (maximumValue - minimumValue);
    return newValue;
  }, [sliderWidth, minimumValue, maximumValue, value]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          isDragging.current = true;
          onSlidingStart?.();
          if (sliderWidth > 0 && evt.nativeEvent.locationX !== undefined) {
            const touchX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newValue = calculateValue(touchX);
            onValueChange?.(newValue);
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (isDragging.current && sliderWidth > 0) {
            const touchX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newValue = calculateValue(touchX);
            onValueChange?.(newValue);
          }
        },
        onPanResponderRelease: (evt) => {
          if (isDragging.current && sliderWidth > 0) {
            const touchX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newValue = calculateValue(touchX);
            onSlidingComplete?.(newValue);
            isDragging.current = false;
          }
        },
        onPanResponderTerminate: (evt) => {
          if (isDragging.current && sliderWidth > 0) {
            const touchX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newValue = calculateValue(touchX);
            onSlidingComplete?.(newValue);
            isDragging.current = false;
          }
        },
      }),
    [calculateValue, onSlidingStart, onValueChange, onSlidingComplete, sliderWidth]
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  }, []);

  return (
    <View 
      style={[styles.container, style]} 
      onLayout={handleLayout}
    >
      <View 
        style={[styles.track, { backgroundColor: maximumTrackTintColor }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: minimumTrackTintColor }]} />
        <View
          style={[
            styles.thumb,
            { backgroundColor: thumbTintColor, left: `${percentage}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomSlider;
