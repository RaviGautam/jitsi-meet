import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import TintedView from './TintedView';

interface CustomLoaderProps {
    numberOfParticipents: number;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ numberOfParticipents }) => {
    const rotateValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        // Only start animation if there's exactly one participant
        if (numberOfParticipents === 1) {
            rotateValue.setValue(0); // Reset the value to 0 before starting animation

            // Continuous rotation loop
            const loopAnimation = Animated.loop(
                Animated.timing(rotateValue, {
                    toValue: 1,
                    duration: 1000, // Duration for one full rotation
                    easing: Easing.linear,
                    useNativeDriver: true, // Use native driver for better performance
                })
            );

            // Store the animation reference
            animationRef.current = loopAnimation;
            
            // Start the loop animation
            loopAnimation.start();
        } else {
            // Stop the animation if there's more than one participant
            animationRef.current?.stop();
        }

        // Cleanup animation on unmount or when numberOfParticipents changes
        return () => {
            animationRef.current?.stop();
        };
    }, [rotateValue, numberOfParticipents]);

    const rotateAnimation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'], // Rotate 360 degrees
    });

    // Only render the loader if there's exactly one participant
    if (numberOfParticipents !== 1) {
        return null;
    }

    return (
        <TintedView>
            <Animated.View style={[styles.loader, { transform: [{ rotate: rotateAnimation }] }]} />
        </TintedView>
    );
};

const styles = StyleSheet.create({
    loader: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 25,
        borderColor: '#d3d3d3',
        borderTopColor: '#fff',
        borderTopWidth: 3,
    },
});

export default CustomLoader;
