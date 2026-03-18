const crypto = require('crypto');

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function seededRng(seed) {
    // Mulberry32-ish seed from string
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function rand() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        const t = (h ^= h >>> 16) >>> 0;
        return t / 4294967296;
    };
}

function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
}

function shuffle(rand, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function titleCase(s) {
    return String(s || '')
        .split(/[\s/_-]+/)
        .filter(Boolean)
        .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function buildPassage({ topic, difficulty, skillFocus, targetWords }, rand) {
    const toneByDifficulty = {
        Beginner: {
            sentenceLen: [10, 16],
            vocab: ['clear', 'simple', 'easy', 'basic', 'friendly'],
        },
        Intermediate: {
            sentenceLen: [14, 22],
            vocab: ['practical', 'structured', 'reliable', 'focused', 'balanced'],
        },
        Advanced: {
            sentenceLen: [18, 28],
            vocab: ['nuanced', 'systemic', 'counterintuitive', 'robust', 'strategic'],
        },
    };

    const d = toneByDifficulty[difficulty] || toneByDifficulty.Intermediate;
    const theme = titleCase(topic || 'General Knowledge');
    const focus = titleCase(skillFocus || 'Comprehension');

    const openingHooks = [
        `Most people think ${theme} is straightforward—until they look closely.`,
        `${theme} shapes decisions in subtle ways, even when we don’t notice it.`,
        `A small change in how we approach ${theme} can produce outsized results.`,
    ];

    const frames = [
        `One reason is that good outcomes depend on both information and interpretation.`,
        `Another reason is that context matters: the same facts can imply different conclusions.`,
        `In practice, people benefit when they slow down to test assumptions and compare alternatives.`,
        `Over time, systems that measure what matters tend to improve faster than systems that merely react.`,
    ];

    const skillLines = {
        Speed: [
            `To read faster without losing meaning, you can preview headings, then scan for key nouns and verbs.`,
            `A helpful trick is to group words into phrases instead of reading one word at a time.`,
        ],
        Vocabulary: [
            `When you meet an unfamiliar word, try deriving meaning from nearby clues before reaching for a definition.`,
            `Repeated exposure in varied contexts is more effective than memorizing isolated lists.`,
        ],
        Inference: [
            `Strong readers often ask, “What is implied here, even if it isn’t stated directly?”`,
            `Look for cause-and-effect language, contrasts, and examples to infer the author’s intent.`,
        ],
        Comprehension: [
            `A quick summary after each paragraph helps consolidate the main idea.`,
            `Questions like “What is the claim, and what evidence supports it?” improve retention.`,
        ],
    };

    const adjectives = d.vocab;
    const mid = [
        `A ${pick(rand, adjectives)} approach starts with defining the goal, then selecting evidence that actually matches it.`,
        pick(rand, frames),
        pick(rand, frames),
        pick(rand, skillLines[focus] || skillLines.Comprehension),
        pick(rand, skillLines[focus] || skillLines.Comprehension),
        `Finally, it helps to check your understanding by explaining the idea in one sentence.`,
    ];

    const closing = [
        `In the end, progress with ${theme} comes from consistency: small, repeatable habits compound.`,
        `With practice, you can handle harder material while staying accurate and confident.`,
        `That balance—speed with meaning—is what turns reading into a usable skill.`,
    ];

    let sentences = [pick(rand, openingHooks), ...mid, ...closing];

    // Expand to target words with additional supporting sentences.
    const fillers = [
        `For example, a single statistic can be persuasive, but only if it is relevant and interpreted correctly.`,
        `A common mistake is to focus on details while missing the central argument.`,
        `Good readers adjust their pace: they move quickly through familiar parts and slow down on dense sections.`,
        `Even brief reflection—ten seconds—can reveal whether a conclusion truly follows from the text.`,
    ];

    const build = () => sentences.join(' ');
    while (build().trim().split(/\s+/).length < targetWords) {
        sentences.splice(2 + Math.floor(rand() * Math.max(1, sentences.length - 4)), 0, pick(rand, fillers));
    }

    // Convert to paragraphs.
    const paraCount = 3;
    const perPara = Math.ceil(sentences.length / paraCount);
    const paragraphs = [];
    for (let i = 0; i < paraCount; i++) {
        const chunk = sentences.slice(i * perPara, (i + 1) * perPara);
        if (chunk.length) paragraphs.push(chunk.join(' '));
    }

    return paragraphs.join('\n\n');
}

function buildQuiz({ topic, difficulty, skillFocus, passage, quizCount, idPrefix }, rand) {
    const theme = titleCase(topic || 'General Knowledge');
    const focus = titleCase(skillFocus || 'Comprehension');

    const correctTemplates = [
        `It emphasizes interpreting evidence in context.`,
        `It recommends small, consistent habits that compound over time.`,
        `It suggests adjusting pace based on difficulty to keep accuracy.`,
        `It highlights that meaning can be implied, not explicitly stated.`,
        `It focuses on summarizing claims and supporting evidence.`,
    ];

    const wrongTemplates = [
        `It argues that details are always more important than the main idea.`,
        `It claims speed matters more than understanding.`,
        `It suggests memorizing without using context is best.`,
        `It implies interpretation is unnecessary if facts are present.`,
        `It recommends avoiding challenging sections entirely.`,
        `It states consistency has little impact on improvement.`,
    ];

    const stemTemplates = [
        `Which statement best reflects the passage’s main idea about ${theme}?`,
        `According to the passage, what is a practical way to improve ${focus.toLowerCase()}?`,
        `What does the passage imply about how readers should handle difficult sections?`,
        `Which conclusion is most supported by the passage?`,
        `What is the author’s purpose in discussing ${theme}?`,
    ];

    const questions = [];
    const usedIds = new Set();

    for (let i = 0; i < quizCount; i++) {
        const id = `${idPrefix || 'q'}${i + 1}-${crypto.randomUUID().slice(0, 6)}`;
        if (usedIds.has(id)) continue;
        usedIds.add(id);

        const correct = pick(rand, correctTemplates);
        const distractors = shuffle(rand, wrongTemplates).slice(0, 3);
        const options = shuffle(rand, [correct, ...distractors]);
        const question = pick(rand, stemTemplates);

        questions.push({
            id,
            question,
            options,
            correctAnswer: correct,
        });
    }

    return questions;
}

function generateLocalAssessment({ topic, difficulty, skillFocus }) {
    const safeDifficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty) ? difficulty : 'Intermediate';
    const safeSkill =
        ['Speed', 'Comprehension', 'Vocabulary', 'Inference'].includes(skillFocus) ? skillFocus : 'Comprehension';

    const seed = `${topic || ''}|${safeDifficulty}|${safeSkill}`;
    const rand = seededRng(seed);

    const targetWords = clamp(safeDifficulty === 'Beginner' ? 260 : safeDifficulty === 'Advanced' ? 340 : 300, 240, 380);
    const passage = buildPassage(
        { topic, difficulty: safeDifficulty, skillFocus: safeSkill, targetWords },
        rand
    );

    const quiz = buildQuiz(
        {
            topic,
            difficulty: safeDifficulty,
            skillFocus: safeSkill,
            passage,
            quizCount: 5,
            idPrefix: 'q',
        },
        rand
    );

    return {
        title: `${titleCase(topic || 'Reading')} — ${safeSkill} (${safeDifficulty})`,
        content: passage,
        quiz,
        source: 'local',
    };
}

module.exports = { generateLocalAssessment };

