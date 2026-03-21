import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../core/theme/colors';
import { FONTS } from '../../../core/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../config/api';

const FREQUENCY_OPTIONS = [
    { id: 'daily', title: 'Daily', desc: 'Consistent reading habits' },
    { id: 'weekly', title: 'Weekly', desc: 'Reading a few times a week' },
    { id: 'rarely', title: 'Rarely', desc: 'Just starting out or occasional' }
];

const MATERIAL_OPTIONS = [
    { id: 'fiction', label: 'Fiction', icon: 'auto-stories' },
    { id: 'non-fiction', label: 'Non-fiction', icon: 'menu-book' },
    { id: 'academic', label: 'Academic', icon: 'school' },
    { id: 'news', label: 'News', icon: 'newspaper' },
    { id: 'blogs', label: 'Blogs', icon: 'rss-feed' },
    { id: 'custom', label: 'Other / Custom', icon: 'edit' }
];

const RATING_OPTIONS = [
    { id: '1', label: 'Beginner', desc: 'I struggle with speed and focus' },
    { id: '2', label: 'Average', desc: 'I read at a normal pace' },
    { id: '3', label: 'Expert', desc: 'I read quickly and retain most info' }
];

export default function OnboardingScreen({ navigation }) {
    const [selectedFreq, setSelectedFreq] = useState('daily');
    const [selectedMaterials, setSelectedMaterials] = useState(['fiction', 'academic']);
    const [selectedRating, setSelectedRating] = useState('2');
    const [customCategory, setCustomCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleMaterial = (id) => {
        setSelectedMaterials(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleContinue = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/user/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    readingFrequency: selectedFreq,
                    preferredType: selectedMaterials
                        .map(m => m === 'custom' ? customCategory : MATERIAL_OPTIONS.find(opt => opt.id === m)?.label || m)
                        .filter(Boolean)
                        .join(', '),
                    selfRating: selectedRating
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // If already submitted, we can still move forward to assessment
                if (data.message === 'Survey already submitted') {
                    navigation.navigate('AssessmentIntro');
                    return;
                }
                throw new Error(data.message || 'Something went wrong');
            }

            // Update stored user status
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                userData.onboardingCompleted = true;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
            }

            navigation.navigate('AssessmentIntro');
        } catch (error) {
            console.error('Onboarding Error:', error);
            Alert.alert('Error', error.message || 'Could not save onboarding data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace('Landing')}
                >
                    <MaterialIcons name="arrow-back-ios" size={20} color="#d1fae5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Onboarding</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>

            {/* Progress Section */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressTitle}>Personalize your experience</Text>
                    <Text style={styles.progressStep}>Step 1 of 3</Text>
                </View>
                <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: '33.33%' }]} />
                </View>
            </View>

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Question 1: Frequency */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How often do you read?</Text>

                    <View style={styles.optionsList}>
                        {FREQUENCY_OPTIONS.map((option) => {
                            const isSelected = selectedFreq === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.radioItem,
                                        isSelected && styles.radioItemSelected
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedFreq(option.id)}
                                >
                                    <View style={styles.radioTextContainer}>
                                        <Text style={styles.radioTitle}>{option.title}</Text>
                                        <Text style={styles.radioDesc}>{option.desc}</Text>
                                    </View>
                                    <View style={[
                                        styles.radioCircle,
                                        isSelected && styles.radioCircleSelected
                                    ]}>
                                        {isSelected && <View style={styles.radioDot} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Question 2: Materials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred reading material?</Text>
                    <Text style={styles.sectionSubtitle}>Select all that apply to you</Text>

                    <View style={styles.pillContainer}>
                        {MATERIAL_OPTIONS.map((item) => {
                            const isSelected = selectedMaterials.includes(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.pillItem,
                                        isSelected && styles.pillItemSelected
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => toggleMaterial(item.id)}
                                >
                                    <MaterialIcons
                                        name={item.icon}
                                        size={16}
                                        color={isSelected ? '#fff' : '#d1fae5'}
                                    />
                                    <Text style={[
                                        styles.pillText,
                                        isSelected && styles.pillTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedMaterials.includes('custom') && (
                        <View style={styles.customInputContainer}>
                            <Text style={styles.customInputLabel}>ENTER YOUR CUSTOM CATEGORY</Text>
                            <TextInput
                                style={styles.customInput}
                                placeholder="e.g. Philosophy, Manga, Tech News..."
                                placeholderTextColor="rgba(52, 211, 153, 0.4)"
                                value={customCategory}
                                onChangeText={setCustomCategory}
                                autoFocus={true}
                            />
                        </View>
                    )}
                </View>

                {/* Question 3: Self Rating */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How do you rate your reading?</Text>

                    <View style={styles.optionsList}>
                        {RATING_OPTIONS.map((option) => {
                            const isSelected = selectedRating === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.radioItem,
                                        isSelected && styles.radioItemSelected
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedRating(option.id)}
                                >
                                    <View style={styles.radioTextContainer}>
                                        <Text style={styles.radioTitle}>{option.label}</Text>
                                        <Text style={styles.radioDesc}>{option.desc}</Text>
                                    </View>
                                    <View style={[
                                        styles.radioCircle,
                                        isSelected && styles.radioCircleSelected
                                    ]}>
                                        {isSelected && <View style={styles.radioDot} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Smart Analysis Card */}
                <View style={styles.analysisCard}>
                    <View style={styles.analysisIconBg}>
                        <MaterialIcons name="analytics" size={24} color={COLORS.emeraldPrimary} />
                    </View>
                    <View style={styles.analysisTextContent}>
                        <Text style={styles.analysisTitle}>Smart Analysis</Text>
                        <Text style={styles.analysisDesc}>We'll tailor your daily goals based on these answers.</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Floating Bottom Action */}
            <View style={styles.bottomArea}>
                <View style={styles.bottomGradient} />

                <TouchableOpacity
                    style={styles.continueButton}
                    activeOpacity={0.9}
                    onPress={handleContinue}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.continueButtonText}>Continue</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.homeIndicatorPlaceholder}>
                    <View style={styles.homeIndicator} />
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgEmeraldDark, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#ecfdf5',
        fontSize: 18,
        fontFamily: FONTS.lexend.bold,
        flex: 1,
        textAlign: 'center',
        paddingRight: 40,
        letterSpacing: -0.5,
    },
    headerRightPlaceholder: {
        width: 40,
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 12,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    progressTitle: {
        color: '#ecfdf5',
        fontSize: 16,
        fontFamily: FONTS.lexend.semiBold,
    },
    progressStep: {
        color: COLORS.accentGold,
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
    },
    progressBarTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.accentGold,
        borderRadius: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 140,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.lexend.bold,
        marginBottom: 16,
        lineHeight: 28,
    },
    sectionSubtitle: {
        color: 'rgba(52, 211, 153, 0.6)',
        fontSize: 14,
        fontFamily: FONTS.lexend.regular,
        marginTop: -8,
        marginBottom: 16,
    },
    optionsList: {
        gap: 12,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(6, 78, 59, 0.2)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(6, 78, 59, 0.5)',
    },
    radioItemSelected: {
        borderColor: COLORS.emeraldPrimary,
    },
    radioTextContainer: {
        flex: 1,
    },
    radioTitle: {
        color: '#ecfdf5',
        fontSize: 16,
        fontFamily: FONTS.lexend.medium,
    },
    radioDesc: {
        color: 'rgba(52, 211, 153, 0.6)',
        fontSize: 12,
        marginTop: 2,
        fontFamily: FONTS.lexend.regular,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#047857',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: COLORS.emeraldDark,
        backgroundColor: COLORS.emeraldDark,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(6, 78, 59, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(6, 78, 59, 0.5)',
        gap: 8,
    },
    pillItemSelected: {
        backgroundColor: COLORS.emeraldDark,
        borderColor: COLORS.emeraldDark,
    },
    pillText: {
        color: '#d1fae5',
        fontSize: 14,
        fontFamily: FONTS.lexend.medium,
    },
    pillTextSelected: {
        color: '#fff',
    },
    analysisCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 16,
        marginTop: 8,
        gap: 16,
    },
    analysisIconBg: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analysisTextContent: {
        flex: 1,
    },
    analysisTitle: {
        color: COLORS.emeraldPrimary,
        fontSize: 14,
        fontFamily: FONTS.lexend.bold,
    },
    analysisDesc: {
        color: 'rgba(52, 211, 153, 0.6)',
        fontSize: 12,
        fontFamily: FONTS.lexend.regular,
        marginTop: 2,
    },
    bottomArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 32,
    },
    bottomGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.bgEmeraldDark,
        opacity: 0.95,
    },
    continueButton: {
        backgroundColor: COLORS.emeraldPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        gap: 8,
        elevation: 8,
        shadowColor: COLORS.emeraldPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.lexend.bold,
    },
    homeIndicatorPlaceholder: {
        alignItems: 'center',
        marginTop: 24,
    },
    homeIndicator: {
        width: 128,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(6, 78, 59, 0.5)',
    },
    customInputContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: 'rgba(6, 78, 59, 0.3)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    customInputLabel: {
        color: 'rgba(52, 211, 153, 0.8)',
        fontSize: 10,
        fontFamily: FONTS.lexend.bold,
        letterSpacing: 1,
        marginBottom: 8,
    },
    customInput: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.lexend.medium,
        padding: 0,
    }
});

