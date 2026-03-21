import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../core/theme/colors';
import { FONTS } from '../../../core/theme/typography';

export default function AssessmentIntroScreen({ navigation, route }) {
    return (
        <SafeAreaView style={styles.container}>

            {/* Top App Bar */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerIconContainer}
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace('Landing')}
                >
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.slate900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Setup</Text>
                <TouchableOpacity style={styles.headerIconContainer}>
                    <MaterialIcons name="more-vert" size={24} color={COLORS.slate900} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.mainTitle}>Initial Evaluation</Text>

                {/* Vertical Timeline Section */}
                <View style={styles.timelineContainer}>
                    {/* Vertical Line */}
                    <View style={styles.timelineLine} />

                    {/* Step 1 */}
                    <View style={styles.stepItem}>
                        <View style={styles.stepIconContainer}>
                            <MaterialIcons name="menu-book" size={20} color={COLORS.assessmentBgDark} />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Read a Passage</Text>
                            <Text style={styles.stepDesc}>A short 500-word excerpt tailored to your interests.</Text>
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>5 minutes</Text>
                            </View>
                        </View>
                    </View>

                    {/* Step 2 */}
                    <View style={styles.stepItem}>
                        <View style={styles.stepIconContainer}>
                            <MaterialIcons name="quiz" size={20} color={COLORS.assessmentBgDark} />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Answer Questions</Text>
                            <Text style={styles.stepDesc}>Comprehension checks based on the passage you read.</Text>
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>6 questions</Text>
                            </View>
                        </View>
                    </View>

                    {/* Step 3 */}
                    <View style={[styles.stepItem, styles.lastStepItem]}>
                        <View style={styles.stepIconContainer}>
                            <MaterialIcons name="trending-up" size={20} color={COLORS.assessmentBgDark} />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Get Your Level</Text>
                            <Text style={styles.stepDesc}>Instant diagnostic results and baseline speed metrics.</Text>
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Instant result</Text>
                            </View>
                        </View>
                    </View>

                </View>

                {/* Pro Tip Box */}
                <View style={styles.proTipContainer}>
                    <View style={styles.proTipHeader}>
                        <MaterialIcons name="lightbulb" size={20} color="#d97706" /* amber-600 */ />
                        <Text style={styles.proTipTitle}>Pro Tip</Text>
                    </View>
                    <Text style={styles.proTipText}>
                        Read at your natural pace for the most accurate results. This assessment sets your personalized training path.
                    </Text>
                    <TouchableOpacity style={styles.learnMoreContainer}>
                        <Text style={styles.learnMoreText}>Learn more</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#92400e" /* amber-800 */ />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Action Area (Bottom) */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('AssessmentReading', {
                        skillFocus: route.params?.skillFocus || 'Comprehension',
                        difficulty: route.params?.difficulty || 'Medium'
                    })}
                    activeOpacity={0.8}
                >
                    <Text style={styles.startButtonText}>Start Now</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}>
                    By starting, you agree to our assessment guidelines.
                </Text>
                <View style={styles.homeIndicatorContainer}>
                    <View style={styles.homeIndicator} />
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.assessmentBgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16, // Safe area approximation
        paddingBottom: 8,
        backgroundColor: COLORS.assessmentBgLight,
        zIndex: 10,
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.slate900,
        fontSize: 18,
        fontFamily: FONTS.notoSans.semiBold,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    mainTitle: {
        color: COLORS.slate900,
        fontSize: 36,
        fontFamily: FONTS.newsreader.bold,
        lineHeight: 44,
        letterSpacing: -0.5,
        marginBottom: 32,
    },
    timelineContainer: {
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 19, // Center of the 40px icon
        top: 16,
        bottom: 16,
        width: 2,
        backgroundColor: 'rgba(19, 236, 128, 0.3)', // primary/30
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
    },
    lastStepItem: {
        marginBottom: 0,
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.assessmentPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 24,
        zIndex: 10,
        elevation: 4,
        shadowColor: COLORS.assessmentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    stepContent: {
        flex: 1,
        paddingTop: 4,
    },
    stepTitle: {
        color: COLORS.slate900,
        fontSize: 18,
        fontFamily: FONTS.notoSans.semiBold,
    },
    stepDesc: {
        color: COLORS.slate500,
        fontSize: 14,
        fontFamily: FONTS.notoSans.regular,
        marginTop: 8,
        lineHeight: 20,
    },
    badgeContainer: {
        marginTop: 8,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(19, 236, 128, 0.1)', // primary/10
        borderWidth: 1,
        borderColor: 'rgba(19, 236, 128, 0.2)', // primary/20
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#0e9f55', // slightly darker text for readability on light bg
        fontSize: 12,
        fontFamily: FONTS.notoSans.medium,
    },
    proTipContainer: {
        marginTop: 48,
        backgroundColor: '#fffbeb', // amber-50
        borderWidth: 2,
        borderColor: 'rgba(251, 191, 36, 0.5)', // amber-400/50
        borderRadius: 12,
        padding: 20,
    },
    proTipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    proTipTitle: {
        color: '#92400e', // amber-800
        fontSize: 16,
        fontFamily: FONTS.notoSans.bold,
    },
    proTipText: {
        color: '#b45309', // amber-700
        fontSize: 14,
        fontFamily: FONTS.notoSans.regular,
        lineHeight: 22,
    },
    learnMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    learnMoreText: {
        color: '#92400e', // amber-800
        fontSize: 14,
        fontFamily: FONTS.notoSans.bold,
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 16,
        backgroundColor: COLORS.assessmentBgLight,
    },
    startButton: {
        backgroundColor: COLORS.assessmentPrimary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.assessmentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    startButtonText: {
        color: COLORS.assessmentBgDark,
        fontSize: 18,
        fontFamily: FONTS.notoSans.bold,
    },
    agreementText: {
        color: COLORS.slate400,
        fontSize: 12,
        fontFamily: FONTS.notoSans.regular,
        textAlign: 'center',
        marginTop: 16,
    },
    homeIndicatorContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    homeIndicator: {
        width: 128,
        height: 6,
        backgroundColor: COLORS.slate300,
        borderRadius: 3,
    }
});
