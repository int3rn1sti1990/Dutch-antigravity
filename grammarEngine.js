const grammarEngine = {
    // Calculates accuracy using Word Error Rate percentage approximation
    calculateWordErrorRate(spoken, target) {
        // Normalize strings by removing punctuation and converting to lowercase
        const cleanString = (str) => str.toLowerCase().replace(/[.,!?]/g, '').trim();
        const spokenWords = cleanString(spoken).split(/\s+/).filter(w => w);
        const targetWords = cleanString(target).split(/\s+/).filter(w => w);

        if (targetWords.length === 0) return 100;

        let matches = 0;
        let errors = 0;

        // Basic unordered matching metric
        targetWords.forEach(word => {
            const indexMatch = spokenWords.indexOf(word);
            if (indexMatch !== -1) {
                matches++;
                // Remove matched word so it's not matched twice
                spokenWords.splice(indexMatch, 1);
            } else {
                errors++;
            }
        });

        // Any leftover words in spoken means they added extra words
        errors += spokenWords.length;

        const totalExpected = targetWords.length;
        // Formula: (Total Expected - Errors) / Total Expected
        let score = ((totalExpected - errors) / totalExpected) * 100;
        return Math.max(0, Math.min(100, Math.round(score)));
    },

    // Checks if the user used "de" instead of "het" or vice versa
    checkArticleUsage(spoken, target) {
        const spokenLower = spoken.toLowerCase();
        const targetLower = target.toLowerCase();

        const articles = ['de', 'het'];

        // Check finding an article + noun pair in the target sentence
        for (let art of articles) {
            const regex = new RegExp(`\\b${art}\\s+([a-z]+)\\b`, 'i');
            const targetMatch = targetLower.match(regex);

            if (targetMatch) {
                const noun = targetMatch[1];
                const otherArt = art === 'de' ? 'het' : 'de';

                // Check if spoken text contains the WRONG article with that SAME noun
                const wrongRegex = new RegExp(`\\b${otherArt}\\s+${noun}\\b`, 'i');
                if (wrongRegex.test(spokenLower)) {
                    return {
                        hasMistake: true,
                        wrongCombo: `${otherArt} ${noun}`,
                        correctCombo: `${art} ${noun}`
                    };
                }
            }
        }
        return { hasMistake: false };
    },

    // Main entrypoint for the Repeat After Me evaluation
    processSpokenSentence(spokenText, targetSentence, cefrLevel) {
        if (!spokenText || spokenText.trim() === '') {
            return {
                score: 0,
                spokenText: "(Nothing detected)",
                feedback: ["I didn't hear anything. Try holding the mic button and speaking clearly."],
                passed: false
            };
        }

        let accuracyScore = this.calculateWordErrorRate(spokenText, targetSentence);
        const feedbackList = [];

        // Nuance 1: Article Gender check
        const articleFeedback = this.checkArticleUsage(spokenText, targetSentence);
        if (articleFeedback.hasMistake) {
            accuracyScore -= 10;
            feedbackList.push(`Dutch Grammar Warning: It is '${articleFeedback.correctCombo}', not '${articleFeedback.wrongCombo}'.`);
        }

        // Help feedback for low scores
        if (accuracyScore < 60) {
            feedbackList.push("Keep practicing! Try listening to the audio slowly and mimicking the rhythm.");
        }

        // Cap score bounds
        accuracyScore = Math.max(0, accuracyScore);

        return {
            score: accuracyScore,
            spokenText: spokenText,
            feedback: feedbackList,
            passed: accuracyScore >= 75 // Passing threshold
        };
    }
};
