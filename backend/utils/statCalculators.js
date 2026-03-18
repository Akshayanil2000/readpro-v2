/**
 * Calculate the current streak based on activity dates
 * @param {Date[]} dates - Array of activity dates
 * @returns {number} - Current streak in days
 */
const calculateStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;

    // 1. Get unique calendar dates (normalize to local date string)
    const uniqueDates = Array.from(new Set(
        dates.map(d => {
            const date = new Date(d);
            // Offsetting to local date to ensure "today" is correct for the user's timezone
            return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                .toISOString().split('T')[0];
        })
    )).sort().reverse(); // Decending: latest first

    if (uniqueDates.length === 0) return 0;

    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
        .toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Date(yesterday.getTime() - (yesterday.getTimezoneOffset() * 60000))
        .toISOString().split('T')[0];

    // 2. Check if streak is alive
    const latestDateStr = uniqueDates[0];
    if (latestDateStr !== todayStr && latestDateStr !== yesterdayStr) {
        return 0; // Gap too large, streak is dead
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]);

        // Difference in days (using local midnights)
        const diffMs = current.getTime() - next.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak++;
        } else {
            break; // Gap found
        }
    }

    return streak;
};

/**
 * Calculate weekly progress percentage (Sessions this week vs last week)
 * @param {Date[]} dates - All session dates
 * @returns {number} - Percentage (e.g., 14 or -5)
 */
const calculateWeeklyProgress = (dates) => {
    if (!dates || dates.length === 0) return 0;

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - 7);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const sessionsThisWeek = dates.filter(d => new Date(d) >= startOfThisWeek).length;
    const sessionsLastWeek = dates.filter(d => {
        const date = new Date(d);
        return date >= startOfLastWeek && date < startOfThisWeek;
    }).length;

    if (sessionsLastWeek === 0) {
        return sessionsThisWeek > 0 ? 100 : 0;
    }

    const diff = sessionsThisWeek - sessionsLastWeek;
    return Math.round((diff / sessionsLastWeek) * 100);
};

module.exports = {
    calculateStreak,
    calculateWeeklyProgress
};
