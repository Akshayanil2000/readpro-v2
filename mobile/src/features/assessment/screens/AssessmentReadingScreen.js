import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

const THEME = {
    primary: '#11d452',
    bgLight: '#f6f8f6',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(17, 212, 82, 0.1)',
};

export default function AssessmentReadingScreen({ navigation, route }) {
    const [ms, setMs] = useState(0);
    const [sec, setSec] = useState(0);
    const [min, setMin] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [passage, setPassage] = useState(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        fetchPassage();
    }, []);

    const fetchPassage = async () => {
        try {
            const { skillFocus, difficulty } = route.params || {};
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            const res = await fetch(`${API_URL}/learning/start`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ skillFocus, difficulty })
            });
            const data = await res.json();
            if (res.status === 401) {
                await AsyncStorage.multiRemove(['token', 'user']);
                navigation.replace('Login');
                return;
            }
            if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch passage');
            
            setPassage({
                ...data,
                category: skillFocus?.toUpperCase() || 'GENERAL',
                timeRead: '8 min read', // Dynamic estimate can be added
                difficulty: difficulty || 'Medium'
            });
            setLoading(false);
            setStartTime(Date.now());
        } catch (error) {
            console.error('Passage load failed:', error);
            Alert.alert(
                'Could not start AI session',
                error?.message || 'Please check your backend server and try again.',
                [
                    { text: 'Back to Dashboard', onPress: () => navigation.replace('Dashboard') }
                ]
            );
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!startTime) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            setMin(minutes);
            setSec(seconds);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [startTime]);

    const handleDone = async () => {
        try {
            setSubmitting(true);
            const rawSeconds = (Date.now() - startTime) / 1000;
            const totalSeconds = Math.max(1, rawSeconds); // Guard against instant clicks
            const wordCount = passage.content.trim().split(/\s+/).length;
            let wpm = Math.round((wordCount / totalSeconds) * 60);
            
            // Cap WPM at 600 for realistic baseline if they click too fast
            if (wpm > 600) wpm = 600;

            navigation.replace('AssessmentQuiz', {
                sessionId: passage.sessionId || null,
                wpm: wpm,
                quiz: passage.quiz,
                isAssessment: !passage.sessionId // Treat as assessment if no sessionId
            });
        } catch (error) {
            console.log('Reading finish fallback triggered:', error.message);
            // Seamless mock navigation
            navigation.replace('AssessmentQuiz', {
                wpm: 245,
                quiz: [] // AssessmentQuizScreen will use its own mock if this is empty
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (m, s) => `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

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
                <TouchableOpacity 
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard')} 
                    style={styles.headerBtn}
                >
                    <MaterialIcons name="arrow-back" size={24} color={THEME.textDark} />
                </TouchableOpacity>

                <View style={styles.timerPill}>
                    <MaterialIcons name="timer" size={16} color={THEME.primary} />
                    <Text style={styles.timerText}>{formatTime(min, sec)}</Text>
                </View>

                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="accessibility" size={24} color={THEME.textDark} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.metaInfo}>
                    <Text style={styles.categoryText}>{passage?.category || 'LEARNING & TECH'}</Text>
                    <Text style={styles.titleText}>{passage?.title}</Text>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <MaterialIcons name="menu-book" size={14} color={THEME.textMuted} />
                            <Text style={styles.statText}>{passage?.timeRead || '8 min read'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialIcons name="trending-up" size={14} color={THEME.textMuted} />
                            <Text style={styles.statText}>{passage?.difficulty || 'Advanced'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {passage?.content.split('\n\n').map((para, i) => {
                        if (para.startsWith('"') && para.endsWith('"')) {
                            return (
                                <View key={i} style={styles.quoteBlock}>
                                    <Text style={styles.quoteText}>{para}</Text>
                                </View>
                            );
                        }
                        return (
                            <Text key={i} style={styles.paragraph}>
                                {para}
                            </Text>
                        );
                    })}
                </View>

                {/* Simulated Image if available */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsqKLfSoOit3QfMmHaz277jdlBWuZFmLdGuE2nqchaVbWGl_aJJtfvYkS8QFRIe4J1tmIUOZSv5kp1oQPe0H0f3YWmlNhFH-oBDVQsCOqkSgONgbOCU9mTM1eBvCvD2H1zII-UAZOMNb9x4pGzWMRKKb5TSMK0S2XioMsOmjS56HsWYHhAE5KxlaQ4W47Co_oBJ2QXmxp_61SDDYXW3SUVsllDVnCcudl31p4A5CN2S88iWIiEJYNef2NJex5ZB-k01PFVZuYUUPs' }}
                        style={styles.image}
                    />
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Bottom Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.doneBtn} 
                    onPress={handleDone}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#0d1b12" />
                    ) : (
                        <>
                            <Text style={styles.doneBtnText}>I'm Done</Text>
                            <MaterialIcons name="check-circle" size={20} color="#0d1b12" />
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.footerNote}>
                    Complete reading to track your progress and earn points
                </Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(246, 248, 246, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(17, 212, 82, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(17, 212, 82, 0.2)',
    },
    timerText: {
        color: THEME.primary,
        fontFamily: FONTS.lexend.bold,
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 160,
    },
    metaInfo: {
        marginBottom: 32,
    },
    categoryText: {
        color: THEME.primary,
        fontFamily: FONTS.lexend.bold,
        fontSize: 12,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    titleText: {
        color: THEME.textDark,
        fontFamily: FONTS.lexend.bold,
        fontSize: 32,
        lineHeight: 40,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        color: THEME.textMuted,
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
    },
    content: {
        gap: 24,
    },
    paragraph: {
        color: '#1e293b',
        fontFamily: FONTS.notoSerif.regular,
        fontSize: 20,
        lineHeight: 34,
    },
    quoteBlock: {
        borderLeftWidth: 4,
        borderLeftColor: THEME.primary,
        paddingLeft: 20,
        marginVertical: 12,
    },
    quoteText: {
        color: THEME.textMuted,
        fontFamily: FONTS.notoSerif.regularItalic,
        fontSize: 18,
        lineHeight: 28,
        fontStyle: 'italic',
    },
    imageContainer: {
        marginVertical: 32,
        borderRadius: 16,
        overflow: 'hidden',
        height: 200,
        width: '100%',
        backgroundColor: '#e2e8f0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(246, 248, 246, 0.95)',
    },
    doneBtn: {
        backgroundColor: THEME.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        elevation: 8,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    doneBtnText: {
        color: '#0d1b12',
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
    },
    footerNote: {
        color: THEME.textMuted,
        fontSize: 12,
        fontFamily: FONTS.lexend.medium,
        textAlign: 'center',
        marginTop: 16,
    }
});

