import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    Alert,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS } from '../../../core/theme/typography';
import API_URL from '../../../config/api';

const { width } = Dimensions.get('window');

const THEME = {
    primary: '#11d452', // Emerald
    bgLight: '#f6f8f6',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(17, 212, 82, 0.1)',
    cardBg: '#ffffff',
    danger: '#ef4444',
};

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ sessions: 0, avgWpm: 0, days: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
            if (token) {
                const response = await fetch(`${API_URL}/learning/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (response.ok) {
                    setStats({
                        sessions: result.stats.totalSessions,
                        avgWpm: result.stats.avgWpm,
                        days: result.stats.totalDays
                    });
                }
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={THEME.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Screen</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="settings" size={24} color={THEME.textDark} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Hero section */}
                <View style={styles.profileHero}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD88htG5YoErpruYAqRMnVUD0XGHs5C5xuaHF2oUkUHONJ-ghndg34l5vD1OMHmpFajbms-7VP7XJ_vJTpaUlRk6rATkTt4Jrrmx6lpd0GdSc04U0UFXGR7CCs1lkTtH8gBXk_g0LfW4Fm2roKWDpmFrxh1xhU1JB1IcSLzcB8BQZrjMPt5uB7baU9A8TnwNv4YVwP4vxx33O8mJR-_KytY2YlWID8Kqmfr2inYy585tnl_a0btwcKnz6ksqCDCTPfI1qfCf9pIAtg' }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.profileName}>{user?.name || 'Akshay Kumar'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'akshay@gmail.com'}</Text>
                </View>

                {/* Stats Blocks as per Mockup */}
                <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>SESSIONS</Text>
                        <Text style={styles.statValue}>{stats.sessions}</Text>
                    </View>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>AVG WPM</Text>
                        <Text style={styles.statValue}>{stats.avgWpm}</Text>
                    </View>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>DAYS</Text>
                        <Text style={styles.statValue}>{stats.days}</Text>
                    </View>
                </View>

                {/* Preferences & Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>PREFERENCES</Text>
                    
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Feather name="user" size={20} color={THEME.primary} />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Account Settings</Text>
                                <Text style={styles.menuDesc}>Update your personal information</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#fefce8' }]}>
                                <Feather name="bell" size={20} color="#eab308" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Notifications</Text>
                                <Text style={styles.menuDesc}>Manage your alerts and daily goals</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                                <Feather name="help-circle" size={20} color="#3b82f6" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Help & Support</Text>
                                <Text style={styles.menuDesc}>Get help from our support team</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danger Zone */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Feather name="log-out" size={18} color={THEME.danger} />
                    <Text style={styles.logoutText}>Log Out Account</Text>
                </TouchableOpacity>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Premium Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                    <MaterialIcons name="home" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="menu-book" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>PRACTICE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AssessmentResult')}>
                    <MaterialIcons name="leaderboard" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>RESULTS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="account-circle" size={24} color={THEME.primary} />
                    <Text style={[styles.navText, { color: THEME.primary }]}>PROFILE</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17, 212, 82, 0.05)',
    },
    headerBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
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
        paddingTop: 32,
        paddingHorizontal: 20,
    },
    profileHero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        backgroundColor: '#fff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileName: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 26,
        color: THEME.textDark,
        marginBottom: 4,
    },
    profileEmail: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 16,
        color: THEME.primary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    statBlock: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    statLabel: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 10,
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 6,
    },
    statValue: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 22,
        color: THEME.textDark,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeading: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 12,
        color: '#94a3b8',
        letterSpacing: 1.5,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.05)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        gap: 16,
    },
    menuIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 15,
        color: THEME.textDark,
    },
    menuDesc: {
        fontFamily: FONTS.lexend.regular,
        fontSize: 13,
        color: THEME.textMuted,
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: '#fff1f2',
        borderWidth: 1,
        borderColor: '#ffe4e6',
        gap: 10,
        marginTop: 8,
    },
    logoutText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 15,
        color: THEME.danger,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        zIndex: 1000,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
    }
});
