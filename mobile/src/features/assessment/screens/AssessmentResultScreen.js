import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS } from '../../../core/theme/typography';
// Note: We'll use the local THEME for precise matching with the mockup
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

const { width } = Dimensions.get('window');

const THEME = {
    primary: '#11d452', // Emerald
    accent: '#fbbf24',  // Gold
    bgLight: '#f6f8f6',
    textDark: '#0f172a',
    textMuted: '#64748b',
    cardBg: '#ffffff',
    border: 'rgba(17, 212, 82, 0.1)',
};

export default function AssessmentResultScreen({ navigation, route }) {
    const { result } = route.params || {};
    const [loading, setLoading] = useState(!result);
    const [metrics, setMetrics] = useState(result ? {
        ...result,
        feedback: result.feedback || [
            { type: 'success', text: "Your reading speed improved significantly.", icon: 'check' },
            { type: 'warning', text: "Focus on reading between the lines.", icon: 'priority-high' },
            { type: 'info', text: "Tip: Try scanning subheadings.", icon: 'lightbulb' }
        ]
    } : {
        wpm: 190,
        accuracy: 68,
        speedChange: '+5%',
        compChange: '-3%',
        feedback: [
            { type: 'success', text: "Your reading speed improved by 15 WPM compared to your last session.", icon: 'check' },
            { type: 'warning', text: "You missed key details in inference questions. Focus on reading between the lines.", icon: 'priority-high' },
            { type: 'info', text: "Tip: Try scanning the subheadings before diving into the body text.", icon: 'lightbulb' }
        ]
    });

    const fetchDataFallback = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const response = await fetch(`${API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                // In a real app, logic would be here to calculate changes and feedback
                setMetrics({
                    wpm: data.user.latestWpm || 190,
                    accuracy: data.user.latestAccuracy || 68,
                    speedChange: '+5%',
                    compChange: '-3%',
                    feedback: [
                        { type: 'success', text: "Your reading speed improved by 15 WPM compared to your last session.", icon: 'check' },
                        { type: 'warning', text: "You missed key details in inference questions. Focus on reading between the lines.", icon: 'priority-high' },
                        { type: 'info', text: "Tip: Try scanning the subheadings before diving into the body text.", icon: 'lightbulb' }
                    ]
                });
            } else {
                // Keep defaults if failed
            }
        } catch (error) {
            console.error('Fetch result error:', error);
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    useEffect(() => {
        if (!result) {
            fetchDataFallback();
        } else {
            setLoading(false);
            setMetrics({
                ...result,
                speedChange: result.speedChange || '+5%',
                compChange: result.compChange || '-3%',
                feedback: Array.isArray(result.feedback) ? result.feedback : [
                    { type: 'success', text: "Your reading speed improved significantly.", icon: 'check' },
                    { type: 'warning', text: "Focus on reading between the lines.", icon: 'priority-high' },
                    { type: 'info', text: "Tip: Try scanning the subheadings.", icon: 'lightbulb' }
                ]
            });
            // Mark assessment as completed in local storage
            AsyncStorage.getItem('user').then(userStr => {
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.assessmentCompleted = true;
                    AsyncStorage.setItem('user', JSON.stringify(user));
                }
            }).catch(e => console.log('Storage update error:', e));
        }
    }, [result, fetchDataFallback]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={THEME.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Result Screen</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Score Section */}
                <View style={styles.hero}>
                    <View style={styles.trophyWrapper}>
                        <MaterialIcons name="workspace-premium" size={32} color={THEME.primary} />
                    </View>
                    <Text style={styles.heroTitle}>Great Effort!</Text>
                    <Text style={styles.heroSubtitle}>You're making steady progress.</Text>
                </View>

                {/* Score Display Cards */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <MaterialIcons name="gps-fixed" size={20} color={THEME.primary} />
                            <Text style={styles.metricLabel}>Accuracy</Text>
                        </View>
                        <Text style={styles.metricValue}>{metrics.accuracy}%</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <MaterialIcons name="bolt" size={20} color={THEME.accent} />
                            <Text style={styles.metricLabel}>Speed</Text>
                        </View>
                        <Text style={styles.metricValue}>
                            {metrics.wpm} <Text style={styles.metricUnit}>WPM</Text>
                        </Text>
                    </View>
                </View>

                {/* Skill Evolution Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SKILL EVOLUTION</Text>
                    <View style={styles.evolutionGrid}>
                        <View style={[styles.evolutionCard, styles.speedEvolution]}>
                            <Text style={styles.evolutionLabel}>Speed</Text>
                            <View style={styles.trendRow}>
                                <MaterialIcons name="trending-up" size={14} color="#059669" />
                                <Text style={styles.trendTextUp}>{metrics.speedChange}</Text>
                            </View>
                        </View>
                        <View style={[styles.evolutionCard, styles.compEvolution]}>
                            <Text style={styles.evolutionLabel}>Comprehension</Text>
                            <View style={styles.trendRow}>
                                <MaterialIcons name="trending-down" size={14} color="#ea580c" />
                                <Text style={styles.trendTextDown}>{metrics.compChange}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Performance Insights */}
                <View style={styles.insightsCard}>
                    <Text style={styles.insightsTitle}>Performance Insights</Text>
                    <View style={styles.insightsList}>
                        {(Array.isArray(metrics.feedback) ? metrics.feedback : []).map((item, index) => (
                            <View key={index} style={styles.insightItem}>
                                <View style={[
                                    styles.itemIcon, 
                                    item.type === 'success' ? styles.iconSuccess : 
                                    item.type === 'warning' ? styles.iconWarning : styles.iconInfo
                                ]}>
                                    <MaterialIcons name={item.icon} size={14} color={
                                        item.type === 'success' ? '#10b981' : 
                                        item.type === 'warning' ? '#fbbf24' : '#3b82f6'
                                    } />
                                </View>
                                <Text style={styles.insightText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 160 }} />
            </ScrollView>

            {/* Bottom Floating CTA */}
            <View style={styles.footerOverlay}>
                <TouchableOpacity 
                    style={styles.ctaButton} 
                    onPress={() => navigation.navigate('Dashboard')}
                >
                    <Text style={styles.ctaText}>Next Recommended Task</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#0f172a" />
                </TouchableOpacity>

                {/* Mock Bottom Nav as per Design */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialIcons name="home" size={24} color="#94a3b8" />
                        <Text style={styles.navText}>HOME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="menu-book" size={24} color="#94a3b8" />
                        <Text style={styles.navText}>PRACTICE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="leaderboard" size={24} color={THEME.primary} />
                        <Text style={[styles.navText, { color: THEME.primary }]}>RESULTS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                        <MaterialIcons name="account-circle" size={24} color="#94a3b8" />
                        <Text style={styles.navText}>PROFILE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bgLight,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: THEME.bgLight,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17, 212, 82, 0.05)',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
        color: THEME.textDark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    trophyWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(17, 212, 82, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 28,
        color: THEME.textDark,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 16,
        color: THEME.textMuted,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    metricLabel: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: THEME.textDark,
    },
    metricValue: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 30,
        color: THEME.textDark,
    },
    metricUnit: {
        fontSize: 14,
        fontFamily: FONTS.lexend.medium,
        color: THEME.textMuted,
    },
    section: {
        marginVertical: 12,
    },
    sectionLabel: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 12,
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 12,
    },
    evolutionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    evolutionCard: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    speedEvolution: {
        backgroundColor: '#ecfdf5',
        borderColor: '#d1fae5',
    },
    compEvolution: {
        backgroundColor: '#fff7ed',
        borderColor: '#ffedd5',
    },
    evolutionLabel: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: THEME.textDark,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendTextUp: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 14,
        color: '#059669',
    },
    trendTextDown: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 14,
        color: '#ea580c',
    },
    insightsCard: {
        marginTop: 24,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.05)',
    },
    insightsTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
        color: THEME.textDark,
        marginBottom: 20,
    },
    insightsList: {
        gap: 16,
    },
    insightItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    itemIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    iconSuccess: {
        backgroundColor: '#ecfdf5',
    },
    iconWarning: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    iconInfo: {
        backgroundColor: '#eff6ff',
    },
    insightText: {
        flex: 1,
        fontFamily: FONTS.lexend.regular,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    footerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: THEME.bgLight,
        paddingTop: 16,
    },
    ctaButton: {
        backgroundColor: THEME.primary,
        marginHorizontal: 16,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
        color: '#0f172a',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        paddingBottom: 24,
        marginTop: 16,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 10,
        color: '#94a3b8',
    }
});
