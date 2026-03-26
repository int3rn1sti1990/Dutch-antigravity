const app = {
    state: {
        activeScreen: 'dashboard',
        // Mock data for Phase 1 MVP
        llTask: {
            dutch: "De kat drinkt melk.",
            audioText: "De kat drinkt melk.",
            hint: "Notice: 'De' noun, not 'het' noun."
        },
        ramTask: {
            dutch: "Ik ga morgen naar het strand.",
            english: "I am going to the beach tomorrow."
        }
    },

    init() {
        console.log("Dutch Learning App Initialized");
    },

    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.state.activeScreen = screenId;
    },

    goHome() {
        this.navigate('dashboard');

        // Reset Listening Lab states
        document.getElementById('blur-overlay').classList.remove('hidden');
        document.getElementById('ll-next-btn').classList.add('hidden');
        document.getElementById('ll-play-btn').classList.remove('hidden');

        // Reset Repeat Task states
        document.getElementById('ram-feedback-area').innerHTML = '';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    startListeningLab() {
        this.navigate('listening-lab');
        document.getElementById('ll-target-phrase').innerText = this.state.llTask.dutch;
        document.getElementById('ll-grammar-hint').innerText = this.state.llTask.hint;
    },

    playListeningAudio() {
        const playBtn = document.getElementById('ll-play-btn');
        playBtn.disabled = true;
        playBtn.innerText = "Playing...";

        // Play the Dutch phrase
        audioEngine.speak(this.state.llTask.audioText, () => {
            // Audio-First Logic: Unlock visual text after audio finishes playing
            document.getElementById('blur-overlay').classList.add('hidden');
            playBtn.classList.add('hidden');
            playBtn.disabled = false;
            playBtn.innerText = "▶ Play Audio";

            // Show complete task button
            document.getElementById('ll-next-btn').classList.remove('hidden');
        });
    },

    startRepeatTask() {
        this.navigate('repeat-task');
        document.getElementById('ram-target-phrase').innerText = this.state.ramTask.dutch;
        document.getElementById('ram-translation').innerText = this.state.ramTask.english;
        document.getElementById('ram-feedback-area').innerHTML = '';
    },

    playRepeatAudio() {
        audioEngine.speak(this.state.ramTask.dutch);
    },

    showFeedback(result) {
        const area = document.getElementById('ram-feedback-area');

        let html = `
            <div class="feedback-score" style="color: ${result.passed ? 'var(--success)' : 'var(--danger)'}">
                Accuracy: ${result.score}%
            </div>
            <div class="feedback-box ${result.passed ? 'feedback-success' : 'feedback-error'}">
                <strong>You said:</strong> ${result.spokenText}
            </div>
        `;

        area.innerHTML = html;

        // Render grammar hints / feedback organically below the transcript
        if (result.feedback && result.feedback.length > 0) {
            result.feedback.forEach(f => {
                const hint = document.createElement('div');
                hint.className = 'feedback-box feedback-error';
                hint.style.fontWeight = '600';
                hint.innerText = f;
                area.appendChild(hint);
            });
        }
    }
};

// Start application hook
window.addEventListener('DOMContentLoaded', () => app.init());
