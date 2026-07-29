const App = {
    progress: {}, // Speichert { "a1-l1": 3, "a1-l2": 0 } (Level-ID -> Sterne)
    currentLesson: null,
    currentQuestionIndex: 0,
    mistakesMade: 0,
    
    init() {
        this.loadProgress();
        this.renderDashboard();
        
        // Event Listener für den Quiz-Next Button
        document.getElementById('btn-next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // Event Listener für Start Quiz aus Info Screen
        document.getElementById('btn-start-quiz').addEventListener('click', () => {
            this.startQuiz();
        });
    },

    // 1. STATE MANAGEMENT
    loadProgress() {
        const saved = localStorage.getItem('kurmanci_progress');
        if (saved) {
            this.progress = JSON.parse(saved);
        } else {
            // Erstes Level standardmäßig freischalten (0 Sterne, aber zugänglich)
            if(window.courseData && window.courseData[0].lessons[0]) {
                this.progress[window.courseData[0].lessons[0].id] = 0;
            }
        }
        this.updateTotalStars();
    },

    saveProgress() {
        localStorage.setItem('kurmanci_progress', JSON.stringify(this.progress));
        this.updateTotalStars();
    },

    updateTotalStars() {
        let total = 0;
        for (let key in this.progress) {
            total += this.progress[key];
        }
        document.getElementById('total-stars').innerText = total;
    },

    // 2. NAVIGATION
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    showDashboard() {
        this.renderDashboard();
        this.switchScreen('screen-dashboard');
    },

    // 3. DASHBOARD RENDERING
    renderDashboard() {
        const container = document.getElementById('path-container');
        container.innerHTML = '';

        window.courseData.forEach(module => {
            // Titel des Moduls (z.B. A1)
            const moduleTitle = document.createElement('h3');
            moduleTitle.innerText = module.title;
            moduleTitle.style.marginBottom = "20px";
            container.appendChild(moduleTitle);

            let isPreviousCompleted = true; // Das allererste Level ist immer frei

            module.lessons.forEach((lesson, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'level-node-wrapper';

                const starsEarned = this.progress[lesson.id] !== undefined ? this.progress[lesson.id] : -1;
                const isLocked = starsEarned === -1 && !isPreviousCompleted;

                // Level Button (Der Stern-Kreis)
                const nodeBtn = document.createElement('button');
                nodeBtn.className = `level-node ${isLocked ? 'locked' : ''}`;
                
                // Zick-Zack Pfad Styling (abwechselnd links/rechts)
                const offset = (index % 2 === 0) ? -30 : 30;
                nodeBtn.style.transform = `translateX(${offset}px)`;

                if(starsEarned > 0) {
                    nodeBtn.innerText = '⭐'.repeat(starsEarned);
                    nodeBtn.style.fontSize = "14px";
                } else if (!isLocked) {
                    nodeBtn.innerText = "▶";
                } else {
                    nodeBtn.innerText = "🔒";
                }

                nodeBtn.onclick = () => {
                    if(!isLocked) this.openInfoScreen(lesson);
                };

                wrapper.appendChild(nodeBtn);
                container.appendChild(wrapper);

                // Info-i-Button (nur wenn unlocked)
                if(!isLocked) {
                    const infoBtn = document.createElement('button');
                    infoBtn.className = 'level-info-btn';
                    infoBtn.innerText = "i";
                    infoBtn.style.transform = `translateX(${offset}px)`;
                    infoBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.openInfoScreen(lesson);
                    };
                    wrapper.appendChild(infoBtn);
                }

                // Logik, ob das nächste Level freigeschaltet ist (mind. 1 Stern im aktuellen)
                isPreviousCompleted = (starsEarned >= 1);
            });
        });
    },

    // 4. INFO SCREEN
    openInfoScreen(lesson) {
        this.currentLesson = lesson;
        document.getElementById('info-title').innerText = lesson.title;
        document.getElementById('info-grammar').innerText = lesson.info.grammar;
        
        const proGrid = document.getElementById('info-pronunciation');
        proGrid.innerHTML = '';
        lesson.info.pronunciation.forEach(p => {
            proGrid.innerHTML += `
                <div class="pro-card">
                    <strong>${p.letter}</strong>
                    <span>${p.desc}</span>
                </div>
            `;
        });

        this.switchScreen('screen-info');
    },

    // 5. QUIZ ENGINE
    startQuiz() {
        this.currentQuestionIndex = 0;
        this.mistakesMade = 0;
        this.renderQuestion();
        this.switchScreen('screen-quiz');
    },

    renderQuestion() {
        const q = this.currentLesson.questions[this.currentQuestionIndex];
        document.getElementById('question-text').innerText = q.question;
        
        // Progress Bar Update
        const progressPercent = (this.currentQuestionIndex / this.currentLesson.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;

        const optContainer = document.getElementById('options-container');
        optContainer.innerHTML = '';

        document.getElementById('feedback-bar').classList.add('hidden');

        if (q.type === 'mc') {
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'mc-option';
                btn.innerText = opt;
                btn.onclick = () => this.checkAnswer(idx === q.correctIndex, btn);
                optContainer.appendChild(btn);
            });
        } else if (q.type === 'translate') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-translate';
            input.placeholder = q.hint || "Tippe hier...";
            
            const checkBtn = document.createElement('button');
            checkBtn.className = 'btn-primary';
            checkBtn.innerText = "Prüfen";
            checkBtn.style.marginTop = "15px";
            
            checkBtn.onclick = () => {
                const isCorrect = q.correctAnswers.some(ans => 
                    ans.toLowerCase().trim() === input.value.toLowerCase().trim()
                );
                this.checkAnswer(isCorrect, input, q.correctAnswers[0]);
            };

            optContainer.appendChild(input);
            optContainer.appendChild(checkBtn);
        }
    },

    checkAnswer(isCorrect, element, correctAnswerStr = null) {
        const fBar = document.getElementById('feedback-bar');
        const fMsg = document.getElementById('feedback-msg');
        fBar.classList.remove('hidden', 'correct', 'wrong');

        // Blockiere weiteres Klicken
        document.querySelectorAll('.mc-option').forEach(b => b.style.pointerEvents = 'none');

        if (isCorrect) {
            fBar.classList.add('correct');
            fMsg.innerHTML = "<strong>Klasse!</strong> Das ist richtig.";
            if(element.classList) element.classList.add('selected'); // Highlight selected MC
        } else {
            this.mistakesMade++;
            fBar.classList.add('wrong');
            fMsg.innerHTML = `<strong>Leider falsch.</strong> ${correctAnswerStr ? 'Richtig wäre: ' + correctAnswerStr : ''}`;
        }
    },

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.currentLesson.questions.length) {
            this.finishLesson();
        } else {
            this.renderQuestion();
        }
    },

    // 6. RESULTATE & STERNE
    finishLesson() {
        const totalQ = this.currentLesson.questions.length;
        let stars = 1; // Mindestens 1 Stern für Abschluss
        
        if (this.mistakesMade === 0) stars = 3;
        else if (this.mistakesMade === 1) stars = 2;
        else stars = 1;

        // Nur updaten, wenn das neue Ergebnis besser ist
        const currentStars = this.progress[this.currentLesson.id] || 0;
        if (stars > currentStars) {
            this.progress[this.currentLesson.id] = stars;
        }

        // Nächstes Level freischalten
        this.unlockNextLevel();
        this.saveProgress();

        // Screen anzeigen
        document.getElementById('result-stars').innerText = '⭐'.repeat(stars);
        document.getElementById('result-msg').innerText = 
            stars === 3 ? "Perfekt! Du hast keine Fehler gemacht." :
            stars === 2 ? "Sehr gut! Nur ein kleiner Fehler." :
            "Geschafft! Übe noch etwas, um mehr Sterne zu bekommen.";

        this.switchScreen('screen-result');
    },

    unlockNextLevel() {
        let foundCurrent = false;
        for (let module of window.courseData) {
            for (let i = 0; i < module.lessons.length; i++) {
                if (foundCurrent) {
                    // Nächstes Level gefunden, freischalten (wenn es noch nicht im Fortschritt steht)
                    if (this.progress[module.lessons[i].id] === undefined) {
                        this.progress[module.lessons[i].id] = 0;
                    }
                    return; // Nur das direkt nächste Level freischalten
                }
                if (module.lessons[i].id === this.currentLesson.id) {
                    foundCurrent = true;
                }
            }
        }
    }
};

// App beim Laden starten
window.onload = () => App.init();
