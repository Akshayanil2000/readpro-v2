import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../core/theme/colors';
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
    accent: '#d4af37', // Gold matching the "Academic" look
};

export default function AssessmentQuizScreen({ navigation, route }) {
    const { quiz, wpm, sessionId } = route.params || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Provide mock data if quiz is missing for UI development
    const activeQuiz = quiz?.length > 0 ? quiz : [
        {
            id: 'q1',
            category: 'Educational Technology',
            question: 'What was the primary argument regarding adaptive learning in the assigned reading?',
            options: [
                'It personalizes content delivery based on real-time user performance metrics.',
                'It replaces the structural need for human instructors in higher education entirely.',
                'It focuses exclusively on rote memorization techniques for standardized testing.',
                'It is only statistically effective for primary and elementary level education models.'
            ]
        },
        {
            id: 'q2',
            category: 'Inference',
            question: 'What does the passage suggest about the "digital divide"?',
            options: [
                'It is narrowing rapidly',
                'It poses a threat to equity in education',
                'It is only relevant to elite institutions',
                'It has no impact on AI adoption'
            ]
        }
    ];

    const currentQuestion = activeQuiz[currentIndex];
    const totalQuestions = activeQuiz.length;
    const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

    const handleOptionSelect = (optionId) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionId
        }));
    };

    const handleNext = async () => {
        if (!userAnswers[currentQuestion.id]) {
            Alert.alert('Selection Required', 'Please select an answer before proceeding.');
            return;
        }

        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            const answersArray = activeQuiz.map(q => ({
                id: q.id,
                answer: userAnswers[q.id]
            }));

            const isAssessment = route.params?.isAssessment;
            const endpoint = isAssessment ? '/assessment/submit' : '/learning/submit';
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId,
                    wpm,
                    answers: answersArray
                })
            });

            const data = await response.json();
            if (response.status === 401) {
                await AsyncStorage.multiRemove(['token', 'user']);
                navigation.replace('Login');
                return;
            }
            if (!response.ok) throw new Error(data?.error || data?.message || 'Failed to submit quiz');

            navigation.navigate('AssessmentResult', {
                result: data
            });
        } catch (error) {
            console.error('Quiz submission failed:', error);
            Alert.alert(
                'Could not submit results',
                error?.message || 'Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />

            {/* Header Structure exactly as per mockup */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard')} 
                        style={styles.iconBtn}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={THEME.textDark} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.academicLabel}>READPRO ACADEMIC</Text>
                        <Text style={styles.questionCounter}>Question {currentIndex + 1} of {totalQuestions}</Text>
                    </View>

                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="more-vert" size={24} color={THEME.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Progress Labels and Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelText}>Progress</Text>
                        <Text style={styles.percentText}>{progress}% Completed</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Topic Badge */}
                <View style={styles.topicBadge}>
                    <Text style={styles.topicBadgeText}>TOPIC: {(currentQuestion.category || 'Educational Technology').toUpperCase()}</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                    <Text style={styles.instructionText}>
                        Select the most accurate conclusion based on the reading provided.
                    </Text>
                </View>

                {/* Options List with Styled Cards */}
                <View style={styles.optionsContainer}>
                    {activeQuiz[currentIndex].options.map((option, index) => {
                        const isSelected = userAnswers[currentQuestion.id] === option;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected
                                ]}
                                activeOpacity={0.7}
                                onPress={() => handleOptionSelect(option)}
                            >
                                <View style={[
                                    styles.customRadio,
                                    isSelected && styles.customRadioSelected
                                ]}>
                                    {isSelected && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer matching mockup */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.nextBtn, !userAnswers[currentQuestion.id] && styles.nextBtnDisabled]} 
                    onPress={handleNext}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={THEME.textDark} />
                    ) : (
                        <>
                            <Text style={styles.nextBtnText}>
                                {currentIndex === totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}
                            </Text>
                            <MaterialIcons name="arrow-forward" size={20} color={THEME.textDark} />
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.copyrightText}>
                    READING ANALYSIS MODULE © READPRO ACADEMIC
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
    header: {
        backgroundColor: '#fff',
        paddingTop: 8,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    academicLabel: {
        color: THEME.accent,
        fontFamily: FONTS.lexend.bold,
        fontSize: 12,
        letterSpacing: 1.5,
    },
    questionCounter: {
        color: '#64748b',
        fontFamily: FONTS.lexend.semiBold,
        fontSize: 14,
        marginTop: 2,
    },
    progressContainer: {
        paddingHorizontal: 24,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabelText: {
        color: THEME.primary,
        fontFamily: FONTS.lexend.semiBold,
        fontSize: 12,
    },
    percentText: {
        color: '#94a3b8',
        fontFamily: FONTS.lexend.medium,
        fontSize: 12,
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: 'rgba(17, 212, 82, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME.primary,
        borderRadius: 3,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 140,
    },
    topicBadge: {
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)',
        marginBottom: 20,
    },
    topicBadgeText: {
        color: '#b45309',
        fontFamily: FONTS.lexend.bold,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    questionSection: {
        marginBottom: 32,
    },
    questionText: {
        fontFamily: FONTS.lexend.bold,
        fontSize: 26,
        lineHeight: 34,
        color: '#0f172a',
        marginBottom: 12,
    },
    instructionText: {
        fontFamily: FONTS.lexend.medium,
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        backgroundColor: '#fff',
        gap: 14,
    },
    optionCardSelected: {
        borderColor: THEME.primary,
        backgroundColor: 'rgba(17, 212, 82, 0.03)',
    },
    customRadio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customRadioSelected: {
        borderColor: THEME.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: THEME.primary,
    },
    optionText: {
        flex: 1,
        fontFamily: FONTS.lexend.medium,
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
    },
    optionTextSelected: {
        color: '#0f172a',
        fontFamily: FONTS.lexend.semiBold,
    },
    footer: {
        padding: 24,
        backgroundColor: 'rgba(246, 248, 246, 0.9)',
    },
    nextBtn: {
        backgroundColor: THEME.primary,
        height: 58,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        elevation: 10,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    nextBtnDisabled: {
        opacity: 0.6,
    },
    nextBtnText: {
        color: '#0d1b12',
        fontFamily: FONTS.lexend.bold,
        fontSize: 18,
    },
    copyrightText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 10,
        color: '#94a3b8',
        fontFamily: FONTS.lexend.bold,
        letterSpacing: 0.5,
    }
});
