import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

const THEME = {
    primary: '#11d452',
    bgLight: '#f6f8f6',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(17, 212, 82, 0.1)',
    cardBg: '#ffffff',
    accent: '#d4af37',
};

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;

export default function InsightsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchInsights = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/learning/insights`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Insights Fetch Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    const { skills, history, weeklySummary, wpmTrend, accTrend } = data || {};
    const avgWpm = history?.length > 0 
        ? Math.round(history.reduce((acc, s) => acc + s.wpm, 0) / history.length) 
        : 0;
    const avgAccuracy = history?.length > 0 
        ? (history.reduce((acc, s) => acc + s.accuracy, 0) / history.length).toFixed(1)
        : 0;

    const generatePath = (values, maxVal, height, width) => {
        if (!values || values.length < 2) return "M 0 100 H 360";
        const points = values.map((v, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - (v / maxVal) * height;
            return { x, y };
        });
        return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    };

    const wpmPath = generatePath(history?.map(s => s.wpm) || [0, 0], 300, 100, CHART_WIDTH);
    const accPath = generatePath(history?.map(s => s.accuracy) || [0, 0], 100, 100, CHART_WIDTH);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={THEME.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Insights Screen</Text>
                <View style={styles.iconBtn} />
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInsights(); }} tintColor={THEME.primary} />
                }
            >
                {/* Weekly Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryLabel}>Weekly Summary</Text>
                            <Text style={styles.summaryTitle}>You completed {weeklySummary?.sessionsCompleted || 0} sessions this week</Text>
                        </View>
                        <View style={styles.trendIconContainer}>
                            <MaterialIcons name="trending-up" size={24} color="#fff" />
                        </View>
                    </View>
                    <View style={styles.summaryStats}>
                        <Text style={styles.summaryPercent}>{weeklySummary?.improvement || '+0%'}</Text>
                        <Text style={styles.summaryComparison}>vs last week</Text>
                    </View>
                </View>

                {/* WPM Chart Card */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.chartLabel}>WPM OVER TIME</Text>
                            <View style={styles.chartMainValueRow}>
                                <Text style={styles.chartValue}>{avgWpm}</Text>
                                <Text style={styles.chartUnit}>avg</Text>
                            </View>
                        </View>
                        <View style={[styles.chartBadge, wpmTrend < 0 && styles.chartBadgeNeg]}>
                            <MaterialIcons 
                                name={wpmTrend >= 0 ? 'arrow-upward' : 'arrow-downward'} 
                                size={14} 
                                color={wpmTrend >= 0 ? THEME.primary : '#ef4444'} 
                            />
                            <Text style={[styles.chartBadgeText, wpmTrend < 0 && styles.chartBadgeTextNeg]}>{wpmTrend >= 0 ? '+' : ''}{wpmTrend ?? 0}%</Text>
                        </View>
                    </View>
                    
                    <View style={styles.svgContainer}>
                        <Svg height="120" width={CHART_WIDTH}>
                            <Defs>
                                <LinearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor={THEME.primary} stopOpacity="0.2" />
                                    <Stop offset="100%" stopColor={THEME.primary} stopOpacity="0" />
                                </LinearGradient>
                            </Defs>
                            <Path
                                d={wpmPath}
                                fill="none"
                                stroke={THEME.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <Path
                                d={`${wpmPath} V 120 H 0 Z`}
                                fill="url(#grad1)"
                            />
                        </Svg>
                    </View>
                    <View style={styles.daysRow}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                            <Text key={day} style={[styles.dayText, i === 2 && styles.dayTextActive]}>{day}</Text>
                        ))}
                    </View>
                </View>

                {/* Accuracy Chart Card */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.chartLabel}>ACCURACY OVER TIME</Text>
                            <View style={styles.chartMainValueRow}>
                                <Text style={styles.chartValue}>{avgAccuracy}</Text>
                                <Text style={styles.chartUnit}>%</Text>
                            </View>
                        </View>
                        <View style={[styles.chartBadge, accTrend < 0 && styles.chartBadgeNeg]}>
                            <MaterialIcons 
                                name={accTrend >= 0 ? 'arrow-upward' : 'arrow-downward'} 
                                size={14} 
                                color={accTrend >= 0 ? THEME.primary : '#ef4444'} 
                            />
                            <Text style={[styles.chartBadgeText, accTrend < 0 && styles.chartBadgeTextNeg]}>{accTrend >= 0 ? '+' : ''}{accTrend ?? 0}%</Text>
                        </View>
                    </View>
                    
                    <View style={styles.svgContainer}>
                        <Svg height="120" width={CHART_WIDTH}>
                            <Defs>
                                <LinearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor={THEME.primary} stopOpacity="0.2" />
                                    <Stop offset="100%" stopColor={THEME.primary} stopOpacity="0" />
                                </LinearGradient>
                            </Defs>
                            <Path
                                d={accPath}
                                fill="none"
                                stroke={THEME.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <Path
                                d={`${accPath} V 120 H 0 Z`}
                                fill="url(#grad2)"
                            />
                        </Svg>
                    </View>
                    <View style={styles.daysRow}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                            <Text key={day} style={[styles.dayText, i === 3 && styles.dayTextActive]}>{day}</Text>
                        ))}
                    </View>
                </View>

                {/* Skill Breakdown Card */}
                <View style={styles.skillBreakdownCard}>
                    <Text style={styles.cardTitle}>Skill Breakdown</Text>
                    <View style={styles.skillList}>
                        {[
                            { label: 'Reading Speed', value: Math.round(skills?.speed || 0) },
                            { label: 'Comprehension', value: Math.round(skills?.comprehension || 0) },
                            { label: 'Vocabulary', value: Math.round(skills?.vocabulary || 0) },
                            { label: 'Inference Skill', value: Math.round(skills?.inference || 0) }
                        ].map((skill, index) => (
                            <View key={index} style={styles.skillItem}>
                                <View style={styles.skillInfo}>
                                    <Text style={styles.skillLabel}>{skill.label}</Text>
                                    <Text style={styles.skillValue}>{skill.value}%</Text>
                                </View>
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: `${skill.value}%` }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Nav Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                    <MaterialIcons name="home" size={26} color="#94a3b8" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="menu-book" size={26} color="#94a3b8" />
                    <Text style={styles.navText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="insights" size={26} color={THEME.primary} />
                    <Text style={[styles.navText, { color: THEME.primary }]}>Insights</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <MaterialIcons name="person" size={26} color="#94a3b8" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: THEME.bgLight,
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
        color: THEME.textDark,
        textAlign: 'center',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    summaryCard: {
        backgroundColor: 'rgba(17, 212, 82, 0.1)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.2)',
        marginBottom: 24,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    summaryLabel: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: '#475569',
    },
    summaryTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 22,
        color: THEME.textDark,
        marginTop: 4,
        maxWidth: '80%',
    },
    trendIconContainer: {
        backgroundColor: THEME.primary,
        padding: 8,
        borderRadius: 12,
    },
    summaryStats: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    summaryPercent: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 20,
        color: THEME.primary,
    },
    summaryComparison: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: THEME.textMuted,
    },
    chartCard: {
        backgroundColor: THEME.cardBg,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    chartLabel: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 12,
        color: THEME.textMuted,
        letterSpacing: 1,
    },
    chartMainValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 4,
    },
    chartValue: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 32,
        color: THEME.textDark,
    },
    chartUnit: {
        fontFamily: FONTS.lexend.regular,
        fontSize: 16,
        color: THEME.textMuted,
    },
    chartBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(17, 212, 82, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    chartBadgeNeg: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    chartBadgeText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 14,
        color: THEME.primary,
    },
    chartBadgeTextNeg: {
        color: '#ef4444',
    },
    svgContainer: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    dayText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 10,
        color: '#94a3b8',
    },
    dayTextActive: {
        color: THEME.primary,
    },
    skillBreakdownCard: {
        backgroundColor: THEME.cardBg,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    cardTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
        color: THEME.textDark,
        marginBottom: 24,
    },
    skillList: {
        gap: 20,
    },
    skillItem: {
        gap: 8,
    },
    skillInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skillLabel: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: '#475569',
    },
    skillValue: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 14,
        color: THEME.primary,
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: THEME.primary,
        borderRadius: 4,
    },
    navBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        paddingBottom: 28,
        zIndex: 100,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
