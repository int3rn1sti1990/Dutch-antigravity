const app = {
    state: {
        activeScreen: 'dashboard',
        llIndex: 0,
        ramIndex: 0,
        listeningTasks: [],
        repeatTasks: []
    },

    init() {
        this.generateDailyTasks();
        console.log("Dutch Learning App Initialized - Daily Tasks Loaded");
    },

    generateDailyTasks() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('dutchApp_taskDate');

        if (savedDate !== today) {
            // Generate new tasks for today by shuffling the task bank
            const shuffledListening = [...taskBank.listeningTasks].sort(() => 0.5 - Math.random());
            const shuffledRepeat = [...taskBank.repeatTasks].sort(() => 0.5 - Math.random());

            // Pick 20 tasks for each module daily
            const dailyListening = shuffledListening.slice(0, 20);
            const dailyRepeat = shuffledRepeat.slice(0, 20);

            this.state.listeningTasks = dailyListening;
            this.state.repeatTasks = dailyRepeat;

            // Save to localStorage so they don't change until tomorrow
            localStorage.setItem('dutchApp_taskDate', today);
            localStorage.setItem('dutchApp_listening', JSON.stringify(dailyListening));
            localStorage.setItem('dutchApp_repeat', JSON.stringify(dailyRepeat));
        } else {
            // Load from localStorage to keep tasks consistent for the day
            this.state.listeningTasks = JSON.parse(localStorage.getItem('dutchApp_listening')) || [];
            this.state.repeatTasks = JSON.parse(localStorage.getItem('dutchApp_repeat')) || [];
        }
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
        document.getElementById('ll-home-btn').classList.add('hidden');
        document.getElementById('ll-play-btn').classList.remove('hidden');

        // Reset Repeat Task states
        document.getElementById('ram-feedback-area').innerHTML = '';
        document.getElementById('ram-next-area').classList.add('hidden');
        document.getElementById('ram-controls').classList.remove('hidden');

        if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    // ----------------------------
    // LISTENING LAB LOGIC
    // ----------------------------

    startListeningLab() {
        this.state.llIndex = 0; // reset progression
        this.navigate('listening-lab');
        this.loadListeningTask();
    },

    loadListeningTask() {
        const task = this.state.listeningTasks[this.state.llIndex];

        document.getElementById('ll-instruction').innerText = `Task ${this.state.llIndex + 1} of ${this.state.listeningTasks.length}`;
        document.getElementById('ll-target-phrase').innerText = task.dutch;
        document.getElementById('ll-grammar-hint').innerText = task.hint;

        // Reset the Audio-First blur
        document.getElementById('blur-overlay').classList.remove('hidden');

        // Controls reset
        const playBtn = document.getElementById('ll-play-btn');
        playBtn.classList.remove('hidden');
        playBtn.disabled = false;
        playBtn.innerText = "▶ Play Audio";

        document.getElementById('ll-next-btn').classList.add('hidden');
        document.getElementById('ll-home-btn').classList.add('hidden');
    },

    playListeningAudio() {
        const task = this.state.listeningTasks[this.state.llIndex];
        const playBtn = document.getElementById('ll-play-btn');
        playBtn.disabled = true;
        playBtn.innerText = "Playing...";

        audioEngine.speak(task.audioText, () => {
            // Unblur only after completion
            document.getElementById('blur-overlay').classList.add('hidden');
            playBtn.classList.add('hidden');

            // Progression check
            if (this.state.llIndex < this.state.listeningTasks.length - 1) {
                document.getElementById('ll-next-btn').classList.remove('hidden');
            } else {
                // Done with all tasks
                document.getElementById('ll-instruction').innerText = "Awesome! You've finished all listening tasks.";
                document.getElementById('ll-home-btn').classList.remove('hidden');
            }
        });
    },

    nextListeningTask() {
        if (this.state.llIndex < this.state.listeningTasks.length - 1) {
            this.state.llIndex++;
            this.loadListeningTask();
        }
    },

    // ----------------------------
    // REPEAT AFTER ME LOGIC
    // ----------------------------

    startRepeatTask() {
        this.state.ramIndex = 0; // reset progression
        this.navigate('repeat-task');
        this.loadRepeatTask();
    },

    loadRepeatTask() {
        const task = this.state.repeatTasks[this.state.ramIndex];

        document.getElementById('ram-instruction').innerText = `Level ${task.level} 🔹 Task ${this.state.ramIndex + 1} of ${this.state.repeatTasks.length}`;
        document.getElementById('ram-target-phrase').innerText = task.dutch;
        document.getElementById('ram-translation').innerText = task.english;
        document.getElementById('ram-grammar-hint').innerText = task.hint || "";

        document.getElementById('ram-feedback-area').innerHTML = '';
        document.getElementById('ram-controls').classList.remove('hidden');
        document.getElementById('ram-next-area').classList.add('hidden');
    },

    playRepeatAudio() {
        const task = this.state.repeatTasks[this.state.ramIndex];
        audioEngine.speak(task.dutch);
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

        if (result.feedback && result.feedback.length > 0) {
            result.feedback.forEach(f => {
                const hint = document.createElement('div');
                hint.className = 'feedback-box feedback-error';
                hint.style.fontWeight = '600';
                hint.style.marginTop = '10px';
                hint.innerText = f;
                area.appendChild(hint);
            });
        }

        // Progression check if passed
        if (result.passed) {
            document.getElementById('ram-controls').classList.add('hidden');
            document.getElementById('ram-next-area').classList.remove('hidden');
            document.getElementById('ram-next-area').classList.add('flex'); // Ensuring it's styled properly

            if (this.state.ramIndex < this.state.repeatTasks.length - 1) {
                document.getElementById('ram-next-btn').innerText = "Next Challenge";
                document.getElementById('ram-next-btn').onclick = () => this.nextRepeatTask();
            } else {
                document.getElementById('ram-instruction').innerText = "Incredible! You passed all speaking levels.";
                document.getElementById('ram-next-btn').innerText = "Finish Scenario";
                document.getElementById('ram-next-btn').onclick = () => this.goHome();
                document.getElementById('ram-home-btn').classList.add('hidden');
            }
        }
    },

    nextRepeatTask() {
        if (this.state.ramIndex < this.state.repeatTasks.length - 1) {
            this.state.ramIndex++;
            this.loadRepeatTask();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
