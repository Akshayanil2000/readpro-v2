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
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../core/theme/colors';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

export default function RegisterScreen({ navigation }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');
        if (!name || !email || !password) {
            setError('Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
            setLoading(false);
            navigation.navigate('Onboarding');
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
                {/* Decorative background blobs - limited implementation in RN without SVG */}
                <View style={styles.topBlob} />
                <View style={styles.bottomBlob} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.slate100} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                {/* Hero Area */}
                <View style={styles.heroArea}>
                    <View style={styles.iconBackground}>
                        <MaterialIcons name="auto-stories" size={48} color={COLORS.forestLight} />
                    </View>
                    <Text style={styles.title}>Create your ReadPro account</Text>
                    <Text style={styles.subtitle}>Start your journey to faster, better reading today.</Text>
                </View>

                {/* Form area */}
                <View style={styles.formContainer}>

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="person" size={20} color={COLORS.slate500} style={styles.inputIconLeft} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={COLORS.slate600}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="mail" size={20} color={COLORS.slate500} style={styles.inputIconLeft} />
                            <TextInput
                                style={styles.input}
                                placeholder="example@email.com"
                                placeholderTextColor={COLORS.slate600}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="lock" size={20} color={COLORS.slate500} style={styles.inputIconLeft} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor={COLORS.slate600}
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setPasswordVisible(!passwordVisible)}
                            >
                                <MaterialIcons
                                    name={passwordVisible ? "visibility" : "visibility-off"}
                                    size={20}
                                    color={COLORS.slate500}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="lock-reset" size={22} color={COLORS.slate500} style={styles.inputIconLeft} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter password"
                                placeholderTextColor={COLORS.slate600}
                                secureTextEntry={!confirmPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            >
                                <MaterialIcons
                                    name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                                    size={20}
                                    color={COLORS.slate500}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                {/* Action Area */}
                <View style={styles.actionContainer}>
                    {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Sign Up</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginPromptContainer}>
                        <Text style={styles.loginPromptText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.replace('Login')}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    scrollContent: {
        paddingBottom: 40,
        minHeight: '100%',
    },
    topBlob: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: 'rgba(212, 175, 55, 0.05)', // gold/5
    },
    bottomBlob: {
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: 'rgba(6, 78, 59, 0.05)', // forest/5
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 48, // safe area spacing approximation
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        color: COLORS.slate100,
        fontSize: 18,
        fontFamily: FONTS.lexend.bold,
        textAlign: 'center',
        flex: 1,
        letterSpacing: -0.2,
    },
    headerRightPlaceholder: {
        width: 48,
    },
    heroArea: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
    },
    iconBackground: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(6, 78, 59, 0.2)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: COLORS.slate100,
        fontSize: 28,
        fontFamily: FONTS.lexend.bold,
        textAlign: 'center',
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: COLORS.slate400,
        fontSize: 16,
        fontFamily: FONTS.lexend.regular,
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    inputGroup: {
        paddingVertical: 12,
    },
    inputLabel: {
        color: COLORS.slate100,
        fontSize: 14,
        fontFamily: FONTS.lexend.semiBold,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // bg-slate-900/50
        borderWidth: 1,
        borderColor: '#1e293b', // slate-800
        borderRadius: 12,
        height: 56,
    },
    inputIconLeft: {
        paddingLeft: 16,
        paddingRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.slate100,
        fontSize: 16,
        fontFamily: FONTS.lexend.regular,
        height: '100%',
    },
    eyeIcon: {
        paddingHorizontal: 16,
        height: '100%',
        justifyContent: 'center',
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingTop: 32,
        marginTop: 16,
    },
    submitButton: {
        backgroundColor: COLORS.forest,
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.forest,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    loginPromptContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        gap: 8,
    },
    loginPromptText: {
        color: COLORS.slate400,
        fontSize: 14,
        fontFamily: FONTS.lexend.regular,
    },
    loginLink: {
        color: COLORS.gold,
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
    }
});
