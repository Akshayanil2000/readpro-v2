import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ImageBackground,
    TouchableOpacity,
    Platform,
    Image,
    Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
    primary: '#004d40',
    accent: '#c5a059',
    backgroundDark: '#101922',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate800: '#1e293b',
    slate900: '#0f172a',
    white: '#ffffff',
};

export default function LandingScreen({ navigation }) {
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const userStr = await AsyncStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.onboardingCompleted) {
                            navigation.replace('Dashboard');
                        } else {
                            navigation.replace('Onboarding');
                        }
                    } else {
                        // Token exists but no user data - might be old session or partial data
                        // Navigate to onboarding as safe default or login
                        navigation.replace('Onboarding');
                    }
                }
            } catch (e) {
                console.error('Landing redirect error:', e);
            }
        };
        checkLoginStatus();
    }, [navigation]);

    const handleAuthRedirect = () => {
        Alert.alert(
            "Access Restricted",
            "Please login or register to view your personalized profile and stats.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => navigation.navigate('Login') },
                { text: "Register", onPress: () => navigation.navigate('Register') }
            ]
        );
    };
    return (
        <View style={styles.container}>
            {/* Mobile Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoIconContainer}>
                        <MaterialIcons name="menu-book" size={20} color={COLORS.accent} />
                    </View>
                    <Text style={styles.headerTitle}>ReadPro</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialIcons name="notifications" size={24} color={COLORS.slate400} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.profileIconContainer} 
                        onPress={handleAuthRedirect}
                    >
                        <MaterialIcons name="person" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.cardContainer}>
                        <ImageBackground
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZYqVnQUdjFYv1msywrFa23kqaFJAsx3p65K6CCK3t4EfkD-cACYqcbq6qMsd5TXTrpRunFD5hgp0dZOcJ4wYqYFdBhi5b34nqZJQVyIRFQBVCtDau3nYaFJ6loCUzzj-j7OAuHQI7Ev0Sb6D_YgcQXjdgAkgyoyMJWM2AyHWlwO29Q9WiqFZFiSigG6G-YZOEHGEM-EfZ55eEIZ9ZVxXeVe3Wpv_9yp7EOgdt9sYdarEDZk0h-hEVbBrPPwO_3qk1TCP9ZwuwMD8' }}
                            style={styles.heroImage}
                            imageStyle={{ borderRadius: 16 }}
                        >
                            <View style={styles.heroOverlay} />
                            <View style={styles.heroContent}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>ADAPTIVE LEARNING</Text>
                                </View>
                                <Text style={styles.heroMainTitle}>Master the Art of{'\n'}Reading</Text>
                            </View>
                        </ImageBackground>
                    </View>

                    <Text style={styles.heroSubtitle}>
                        Unlock your full potential with science-backed adaptive reading skills designed for the modern professional.
                    </Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                            <MaterialIcons name="arrow-forward" size={20} color={COLORS.accent} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton}>
                            <MaterialIcons name="play-circle" size={20} color={COLORS.white} />
                            <Text style={styles.secondaryButtonText}>Watch Demo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Features - Vertical Card List */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Our Methodology</Text>

                    {/* Assess Card */}
                    <TouchableOpacity style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: 'rgba(0, 77, 64, 0.1)' }]}>
                            <MaterialIcons name="speed" size={28} color={COLORS.accent} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureCardTitle}>Assess</Text>
                            <Text style={styles.featureCardSubtitle}>Baseline your current speed and comprehension levels.</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                    </TouchableOpacity>

                    {/* Train Card */}
                    <TouchableOpacity style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                            <MaterialIcons name="fitness-center" size={28} color={COLORS.accent} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureCardTitle}>Train</Text>
                            <Text style={styles.featureCardSubtitle}>Personalized daily drills tailored to your cognitive profile.</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                    </TouchableOpacity>

                    {/* Track Card */}
                    <TouchableOpacity style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: 'rgba(0, 77, 64, 0.1)' }]}>
                            <MaterialIcons name="insights" size={28} color={COLORS.accent} />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureCardTitle}>Track</Text>
                            <Text style={styles.featureCardSubtitle}>Deep analytics and progress reports to visualize growth.</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                    </TouchableOpacity>
                </View>

                {/* Social Proof CTA */}
                <View style={styles.ctaSection}>
                    <View style={styles.ctaCard}>
                        <View style={styles.circleDecorationTopRight} />
                        <View style={styles.circleDecorationBottomLeft} />

                        <View style={styles.ctaContentWrapper}>
                            <View style={styles.avatarsContainer}>
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdh2oJlJEbk2I70jCkQsVbRqH1QK5MNOuCCELdkUvnJQ3rvFgBll9pVGOGPmgXtqFtMmS7rQs--nxHaH6UOEFhJtjOXYf_lcpCY0f0-mDbndHyW9Tl8CQgu-n4TEqwh1KXg0XaTMDFmQ93SrMiif0z_2uSD08YIh5iaCxAI3e4vv6n49xt5BKSE4996YxNMOA1LmWOGUv_fuy-7CGkwh1gufZf2Q8zheP0Xk_3ceqnmuwcWwb_Zp-Yea57xlSJuVLUhOnpfgZ3T8w' }} style={styles.avatar} />
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDw-Dsis7NuOf9UIi30hwKGlpETRNass6VlHJQ4VvseYs0ad6RriosdIng0GjBXD9m0fi4kpRely_UL8HG5OCsTcPbJMK2gzpbAl_a2FSAInmShYlPmUTvousaZeG9AELqQ9u9x-Jl077xPTnGuMl-NxqZbx-Y6DJOYF4Gt1uh2NL1aGkL__bFFRj5TzPKCmxKKBTQWrQFQiYqI-8x0eX7vF80IzkYE85SmhP9WU-FpzbENHKkp1Nnuk1uxptCEKv-in2w0snDBUc' }} style={[styles.avatar, styles.overlapAvatar]} />
                                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDROFySax1pUYmK623JdLaIxArKeLWy4wiL5geL98_p3qMZHUdr14nJXn5lveH7JF3TFJvcvobVzdVZT_juoXZFabUCHPXsFDWeQlBvzFiEyUWX2DRJf0HIjvZaYQlwBWOlxcskNJfggqe6MmEW89HTEA9D63eas6PNRNfuHwv5NnqAwBY2p6jOXqymQ2eaIEyyCTskracWTQCNgG9dKpStumMH7zoEFmrzMW9ZO5wavD9Nt7ydVh-wid9bmNLV7jRApFp3CkIvSFY' }} style={[styles.avatar, styles.overlapAvatar]} />
                                <View style={[styles.avatar, styles.overlapAvatar, styles.avatarCount]}>
                                    <Text style={styles.avatarCountText}>+12k</Text>
                                </View>
                            </View>

                            <Text style={styles.ctaTitle}>Ready to become a{'\n'}Pro Reader?</Text>
                            <Text style={styles.ctaSubtitle}>
                                Join 12,000+ professionals who have doubled their reading efficiency.
                            </Text>

                            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.ctaButtonText}>Join Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="home" size={24} color={COLORS.primary} />
                    <Text style={[styles.navText, { color: COLORS.primary }]}>HOME</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="menu-book" size={24} color={COLORS.slate500} />
                    <Text style={styles.navText}>LIBRARY</Text>
                </TouchableOpacity>

                <View style={styles.navItemFabContainer}>
                    <TouchableOpacity style={styles.fabButton}>
                        <MaterialIcons name="add" size={28} color={COLORS.accent} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Insights')}>
                    <MaterialIcons name="analytics" size={24} color={COLORS.slate500} />
                    <Text style={styles.navText}>STATS</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={handleAuthRedirect}>
                    <MaterialIcons name="settings" size={24} color={COLORS.slate500} />
                    <Text style={styles.navText}>SETTINGS</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 30, // Rough safe area
        paddingBottom: 16,
        backgroundColor: COLORS.backgroundDark,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate900,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIconContainer: {
        backgroundColor: COLORS.primary,
        padding: 6,
        borderRadius: 8,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontFamily: FONTS.lexend.bold,
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        padding: 4,
    },
    profileIconContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 77, 64, 0.4)',
        borderWidth: 2,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    scrollContent: {
        paddingBottom: 100, // Make room for bottom nav
    },
    heroSection: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    cardContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        marginBottom: 24,
    },
    heroImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 77, 64, 0.5)',
    },
    heroContent: {
        padding: 24,
        zIndex: 10,
    },
    badge: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroMainTitle: {
        color: COLORS.white,
        fontSize: 32,
        lineHeight: 38,
        fontFamily: FONTS.lexend.bold,
    },
    heroSubtitle: {
        color: COLORS.slate400,
        fontSize: 16,
        fontFamily: FONTS.lexend.regular,
        lineHeight: 24,
        marginBottom: 24,
    },
    actionButtons: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    secondaryButton: {
        backgroundColor: COLORS.slate800,
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    featuresSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 16,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontFamily: FONTS.lexend.bold,
        marginBottom: 8,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // slightly transparent slate800
        borderWidth: 1,
        borderColor: COLORS.slate800,
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    featureIconBox: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTextContainer: {
        flex: 1,
        gap: 4,
    },
    featureCardTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    featureCardSubtitle: {
        color: COLORS.slate400,
        fontSize: 13,
        fontFamily: FONTS.lexend.regular,
        lineHeight: 18,
    },
    ctaSection: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    ctaCard: {
        backgroundColor: COLORS.slate900,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    circleDecorationTopRight: {
        position: 'absolute',
        top: -48,
        right: -48,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(197, 160, 89, 0.05)',
    },
    circleDecorationBottomLeft: {
        position: 'absolute',
        bottom: -32,
        left: -32,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(197, 160, 89, 0.03)',
    },
    ctaContentWrapper: {
        alignItems: 'center',
        zIndex: 10,
    },
    avatarsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.slate900,
    },
    overlapAvatar: {
        marginLeft: -12,
    },
    avatarCount: {
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCountText: {
        color: COLORS.primary,
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
    },
    ctaTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontFamily: FONTS.lexend.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    ctaSubtitle: {
        color: COLORS.slate300,
        fontSize: 14,
        fontFamily: FONTS.lexend.regular,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    ctaButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
    },
    ctaButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundDark,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Safe area padding
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    navText: {
        color: COLORS.slate500,
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        letterSpacing: 1,
    },
    navItemFabContainer: {
        position: 'relative',
        top: -24,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        borderWidth: 4,
        borderColor: COLORS.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    }
});
