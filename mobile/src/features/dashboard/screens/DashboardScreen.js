import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
    ImageBackground,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { COLORS } from '../../../core/theme/colors';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

const THEME = {
    primary: '#11d452', // Bright Modern Green
    secondary: '#064e3b', // Deep Forest
    accent: '#fbbf24', // Gold
    bgLight: '#f6f8f6',
    bgDark: '#102216',
    textDark: '#101e15',
    textLight: '#f8fafc',
    cardLight: '#ffffff',
    cardDark: '#152b1d',
};

export default function DashboardScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            const response = await fetch(`${API_URL}/learning/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    await AsyncStorage.multiRemove(['token', 'user']);
                    navigation.replace('Login');
                    return;
                }
                throw new Error(result?.error || result?.message || 'Failed to fetch dashboard');
            }

            // Map Backend format to Frontend format
            setData({
                user: result.user,
                activity: {
                    sessions: result.stats.totalSessions,
                    streak: result.stats.streak,
                    weeklyProgress: result.stats.weeklyProgress,
                    weakArea: result.stats.weakArea || 'Inference'
                },
                recommended: {
                    skill: result.recommendation.skillFocus,
                    difficulty: result.recommendation.difficulty,
                    time: '8 min', // Estimated from content length or static
                    reason: result.recommendation.reason
                },
                skills: [
                    { label: 'Speed', value: Math.round(result.skills.speed) || 0 },
                    { label: 'Comprehension', value: Math.round(result.skills.comprehension) || 0 },
                    { label: 'Vocabulary', value: Math.round(result.skills.vocabulary) || 0 },
                    { label: 'Inference', value: Math.round(result.skills.inference) || 0 }
                ]
            });
        } catch (error) {
            console.error('Dashboard Error:', error);
            Alert.alert(
                'Dashboard unavailable',
                error?.message || 'Could not load your learning data. Please make sure the backend is running.',
                [{ text: 'OK' }]
            );
            setData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigation]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    const { user, activity, recommended, skills } = data || {};

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />

            {/* Header Section */}
            <View style={styles.header}>
                <View class="profileRow" style={styles.headerTop}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_UqtUEwWWsQo5Qb6Ta17IV_A1El3gCpNitrjs-7sMjL3H2QFjkL6JRiGDdbcLoAeySeYosucr6rclqEaglTb0roJ7UYMWXtST0kOFpOT89PZ57gWodVKqAA9FW7g_AH1fTZFtDCoGucLJbb-xvXp_xGiUisQBIhSb_0V-l4PBirbt9w5IYpESoAPJyBmM5W12o-fYAO4XmSUZ8tElth3JOHn5hBKPg9Ko5HycB-SlCIjGEXrIaXuQC4pRJ0ytjPxTX-4dCbNCrpg' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <MaterialIcons name="notifications" size={26} color={THEME.textDark} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.greetingText}>Good Evening, {user?.name || 'there'} 👋</Text>
                    <Text style={styles.subtitleText}>Let’s improve your reading today</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
                }
            >
                {/* 1. Activity Summary */}
                <View style={styles.activityCard}>
                    <View style={styles.activityItem}>
                        <View style={styles.sessionsBadge}>
                            <Text style={styles.activityLabel}>SESSIONS</Text>
                        </View>
                        <Text style={styles.activityValue}>{activity?.sessions ?? '-'}</Text>
                    </View>
                    <View style={[styles.activityItem, styles.activityBorder]}>
                        <View style={styles.streakBadge}>
                            <Text style={[styles.activityLabel, { color: '#10b981' }]}>STREAK</Text>
                        </View>
                        <View style={styles.streakRow}>
                            <Text style={styles.activityValue}>{activity?.streak ?? '-'}</Text>
                            <MaterialIcons name="local-fire-department" size={20} color="#f97316" />
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <Text style={styles.weeklyProgressTitle}>Weekly Progress</Text>
                        <Text style={styles.weeklyProgressValue}>
                            {activity?.weeklyProgress != null 
                                ? `${activity.weeklyProgress >= 0 ? '+' : ''}${activity.weeklyProgress}%` 
                                : '-'}
                        </Text>
                    </View>
                </View>

                {/* 2. Today's Task */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today’s Task</Text>
                    <View style={styles.taskCard}>
                        <View style={styles.taskCardGlow} />
                        <View style={styles.taskHeader}>
                            <View style={styles.taskBadge}>
                                <Text style={styles.taskBadgeText}>RECOMMENDED FOR YOU</Text>
                            </View>
                            <View>
                                <Text style={styles.difficultyLabel}>Difficulty</Text>
                                <Text style={styles.difficultyValue}>{recommended?.difficulty || '-'}</Text>
                            </View>
                        </View>
                        <Text style={styles.taskTitle}>{recommended?.skill || '—'}</Text>
                        <View style={styles.taskMeta}>
                            <View style={styles.taskMetaItem}>
                                <MaterialIcons name="schedule" size={16} color="#94a3b8" />
                                <Text style={styles.taskMetaText}>{recommended?.time || '-'}</Text>
                            </View>
                            <View style={styles.metaDivider} />
                            <Text style={styles.reasonText}>{recommended?.reason ? `“${recommended.reason}”` : '—'}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.startBtn}
                            onPress={() => navigation.navigate('AssessmentIntro', {
                                skillFocus: recommended?.skill || 'Comprehension',
                                difficulty: recommended?.difficulty || 'Medium'
                            })}
                            disabled={!recommended?.skill || !recommended?.difficulty}
                        >
                            <Text style={styles.startBtnText}>Start Session</Text>
                            <MaterialIcons name="play-arrow" size={20} color={THEME.textDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. Insight Panel */}
                <View style={styles.insightPanel}>
                    <View style={styles.insightIconContainer}>
                        <MaterialIcons name="lightbulb" size={24} color="#b45309" />
                    </View>
                    <View style={styles.insightTextContainer}>
                        <Text style={styles.insightTitle}>Weak area: {activity?.weakArea || 'Analyzing...'}</Text>
                        <Text style={styles.insightDesc}>
                            {activity?.weakArea === 'Inference' ? 'Focus on understanding implicit meaning in your reading.' : 
                             activity?.weakArea === 'Vocabulary' ? 'Try reading more diverse topics to expand your word bank.' :
                             activity?.weakArea === 'Speed' ? 'Practice rhythmic eye movements to increase your WPM.' :
                             'Consistently practice articles to build strong reading foundations.'}
                        </Text>
                    </View>
                </View>

                {/* 4. Skill Overview */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Skill Overview</Text>
                    <View style={styles.skillsContainer}>
                        {(skills || [
                            { label: 'Speed', value: 84 },
                            { label: 'Comprehension', value: 72 },
                            { label: 'Vocabulary', value: 91 },
                            { label: 'Inference', value: 58 }
                        ]).map((skill, index) => (
                            <View key={index} style={styles.skillItem}>
                                <View style={styles.skillHeader}>
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
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="home" size={26} color={THEME.primary} />
                    <Text style={[styles.navItemText, { color: THEME.primary }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="menu-book" size={26} color="#94a3b8" />
                    <Text style={styles.navItemText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Insights')}>
                    <MaterialIcons name="insights" size={26} color="#94a3b8" />
                    <Text style={styles.navItemText}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <MaterialIcons name="person" size={26} color="#94a3b8" />
                    <Text style={styles.navItemText}>Profile</Text>
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.3)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    notificationBtn: {
        padding: 8,
    },
    headerText: {
        gap: 4,
    },
    greetingText: {
        fontSize: 28,
        fontFamily: FONTS.lexend.bold,
        color: THEME.textDark,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: FONTS.lexend.medium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.1)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    activityItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.1)',
    },
    activityLabel: {
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        color: '#4f46e5', // Primary blue for Sessions
        letterSpacing: 0.5,
    },
    sessionsBadge: {
        backgroundColor: '#eef2ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    streakBadge: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    activityValue: {
        fontSize: 22,
        fontFamily: FONTS.lexend.bold,
        color: THEME.textDark,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    weeklyProgressTitle: {
        fontSize: 9,
        color: '#64748b',
        textAlign: 'center',
        fontFamily: FONTS.lexend.medium,
    },
    weeklyProgressValue: {
        fontSize: 15,
        fontFamily: FONTS.lexend.bold,
        color: THEME.textDark,
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.lexend.bold,
        color: THEME.textDark,
        marginBottom: 16,
    },
    taskCard: {
        backgroundColor: '#0d1b12',
        borderRadius: 20,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    taskCardGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        backgroundColor: 'rgba(17, 212, 82, 0.2)',
        borderRadius: 60,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskBadge: {
        backgroundColor: 'rgba(17, 212, 82, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    taskBadgeText: {
        color: THEME.primary,
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        letterSpacing: 0.5,
    },
    difficultyLabel: {
        color: '#94a3b8',
        fontSize: 11,
        textAlign: 'right',
        fontFamily: FONTS.lexend.medium,
    },
    difficultyValue: {
        color: THEME.primary,
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
        textAlign: 'right',
    },
    taskTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: FONTS.lexend.bold,
        marginBottom: 12,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    taskMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    taskMetaText: {
        color: '#cbd5e1',
        fontSize: 14,
        fontFamily: FONTS.lexend.medium,
    },
    metaDivider: {
        width: 1,
        height: 14,
        backgroundColor: '#334155',
        marginHorizontal: 12,
    },
    reasonText: {
        color: '#94a3b8',
        fontSize: 12,
        fontFamily: FONTS.lexend.italic,
        flex: 1,
    },
    startBtn: {
        backgroundColor: THEME.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    startBtnText: {
        color: THEME.textDark,
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    insightPanel: {
        flexDirection: 'row',
        backgroundColor: '#fffbeb',
        marginHorizontal: 24,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
        gap: 16,
        alignItems: 'center',
    },
    insightIconContainer: {
        backgroundColor: '#fef3c7',
        padding: 10,
        borderRadius: 12,
    },
    insightTextContainer: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
        color: '#92400e',
    },
    insightDesc: {
        fontSize: 12,
        color: '#b45309',
        fontFamily: FONTS.lexend.medium,
        marginTop: 2,
    },
    skillsContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.05)',
        gap: 20,
    },
    skillItem: {
        gap: 8,
    },
    skillHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skillLabel: {
        fontSize: 14,
        fontFamily: FONTS.lexend.medium,
        color: '#334155',
    },
    skillValue: {
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
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
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        paddingBottom: 28,
        zIndex: 100,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navItemText: {
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        color: '#94a3b8',
    }
});

