const audioEngine = {
    isRecording: false,
    recognition: null,

    initRecognition() {
        // Use browser-native SpeechRecognition for free Speech-to-text
        const SpeechRecognitionInfo = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionInfo) {
            alert("Speech Recognition API is not supported in this browser. Please use Google Chrome for full functionality.");
            return false;
        }

        this.recognition = new SpeechRecognitionInfo();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // Critical for Dutch Nuance Tracking
        this.recognition.lang = 'nl-NL';

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Recognized Dutch: ", transcript);
            this.processRecording(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error !== 'aborted') {
                app.showFeedback({
                    score: 0,
                    spokenText: "Error: " + event.error,
                    passed: false,
                    feedback: ["Ensure microphone permissions are granted."]
                });
            }
        };

        return true;
    },

    speak(text, onComplete = null) {
        // Use browser-native SpeechSynthesis for Text-to-Speech audio cues
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Clear any existing speech

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 0.85; // slightly slower for learners to hear phonetics

            if (onComplete) {
                utterance.onend = onComplete;
                // Fallback timeout in case onend doesn't fire (browser bugs)
                setTimeout(() => {
                    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
                    onComplete();
                }, (text.length * 150) + 1000);
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Speech Synthesis not supported");
            if (onComplete) onComplete();
        }
    },

    startRecording() {
        if (this.isRecording) return;
        if (!this.recognition && !this.initRecognition()) return;

        try {
            this.recognition.start();
            this.isRecording = true;
            document.getElementById('ram-mic-btn').classList.add('recording');
        } catch (e) {
            console.error("Could not start recording context: ", e);
        }
    },

    stopRecording() {
        if (!this.isRecording) return;

        try {
            this.recognition.stop();
            this.isRecording = false;
            document.getElementById('ram-mic-btn').classList.remove('recording');
        } catch (e) {
            console.error(e);
        }
    },

    processRecording(transcript) {
        const target = app.state.ramTask.dutch;
        // Evaluate the output utilizing the Grammar Engine logic
        const result = grammarEngine.processSpokenSentence(transcript, target, 'A1');
        app.showFeedback(result);
    }
};
