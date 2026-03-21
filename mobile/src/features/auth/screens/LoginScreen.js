import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../core/theme/colors';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

export default function LoginScreen({ navigation }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }
            await AsyncStorage.setItem('token', data.token);
            // Store user info and completion status
            await AsyncStorage.setItem('user', JSON.stringify({ 
                id: data.id, 
                name: data.name, 
                email: data.email,
                onboardingCompleted: data.onboardingCompleted,
                assessmentCompleted: data.assessmentCompleted
            }));
            
            setLoading(false);
            
            // Navigate conditionally
            if (data.onboardingCompleted) {
                navigation.replace('Dashboard');
            } else {
                navigation.replace('Onboarding');
            }
        } catch (err) {
            setLoading(false);
            setError('Network error');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Top Header Section */}
                <View style={styles.header}>
                    <MaterialIcons name="auto-stories" size={40} color={COLORS.primary} />
                    <Text style={styles.headerTitle}>ReadPro</Text>
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Continue your journey toward mastery.</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                        <View style={[
                            styles.inputWrapper,
                            isFocused === 'email' && styles.inputWrapperFocused
                        ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="name@academic.edu"
                                placeholderTextColor={COLORS.slate300}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setIsFocused('email')}
                                onBlur={() => setIsFocused('')}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>PASSWORD</Text>
                        <View style={[
                            styles.inputWrapper,
                            isFocused === 'password' && styles.inputWrapperFocused
                        ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.slate300}
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setIsFocused('password')}
                                onBlur={() => setIsFocused('')}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setPasswordVisible(!passwordVisible)}
                            >
                                <MaterialIcons
                                    name={passwordVisible ? "visibility" : "visibility-off"}
                                    size={20}
                                    color={COLORS.slate300}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password */}
                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>LOGIN</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Social Login Section */}
                <View style={styles.socialSection}>
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR CONNECT WITH</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity style={styles.googleButton}>
                        {/* Using MaterialCommunityIcons for Google logo fallback without react-native-svg */}
                        <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                        <Text style={styles.googleButtonText}>Sign up with Google</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Area */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.replace('Register')}>
                        <Text style={styles.footerLink}>Sign up</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerDivider} />

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    scrollContent: {
        paddingHorizontal: 32,
        paddingTop: 48,
        paddingBottom: 40,
        minHeight: '100%',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 48,
        gap: 8,
    },
    headerTitle: {
        color: COLORS.primary,
        fontSize: 28,
        fontFamily: FONTS.playfair.boldItalic,
        letterSpacing: -0.5,
    },
    welcomeSection: {
        marginBottom: 40,
    },
    title: {
        color: COLORS.primary,
        fontSize: 36,
        fontFamily: FONTS.playfair.bold,
        lineHeight: 44,
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.slate500,
        fontSize: 18,
        fontFamily: FONTS.lora.regularItalic,
    },
    formContainer: {
        gap: 24,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        color: COLORS.slate400,
        fontSize: 10,
        fontFamily: FONTS.playfair.bold, // The design says Playfair or similar headings, but we'll use CrimsonPro or Playfair. The HTML used font-bold uppercase tracking-widest.
        textTransform: 'uppercase',
        letterSpacing: 2,
        paddingHorizontal: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(6, 78, 59, 0.2)', // primary/20
        borderRadius: 8,
        height: 56,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        color: COLORS.slate800,
        fontSize: 16,
        height: '100%',
        paddingLeft: 16,
        fontFamily: FONTS.crimson.regular,
    },
    eyeIcon: {
        paddingHorizontal: 16,
        height: '100%',
        justifyContent: 'center',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: -8,
    },
    forgotPasswordText: {
        color: COLORS.accent,
        fontSize: 14,
        fontFamily: FONTS.lora.regularItalic,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        height: 64,
        borderRadius: 32, // full rounded
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.playfair.bold,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    socialSection: {
        marginTop: 40,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.slate100, // border-slate-100
    },
    dividerText: {
        color: COLORS.slate400,
        fontSize: 10,
        fontFamily: FONTS.playfair.bold,
        textTransform: 'uppercase',
        letterSpacing: 2,
        paddingHorizontal: 16,
        backgroundColor: COLORS.bgLight,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.slate200,
        backgroundColor: '#fff',
        gap: 12,
    },
    googleButtonText: {
        color: COLORS.slate600,
        fontSize: 14,
        fontFamily: FONTS.playfair.bold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 48,
        marginBottom: 24,
    },
    footerText: {
        color: COLORS.slate500,
        fontSize: 15,
        fontFamily: FONTS.lora.regular,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 15,
        fontFamily: FONTS.lora.bold,
    },
    footerDivider: {
        height: 4,
        width: 48,
        backgroundColor: 'rgba(197, 160, 89, 0.2)', // accent/20
        borderRadius: 2,
        alignSelf: 'center',
    }
});
