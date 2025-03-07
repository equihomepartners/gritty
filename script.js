// Data structure
let ideas = [];
let currentIdea = {
    title: '',
    content: '',
    wins: [],
    progress: {
        problemDepth: 50,
        validation: 50,
        execution: 50
    },
    lastEdited: new Date()
};

// DOM Elements
const screens = {
    home: document.getElementById('home'),
    notepad: document.getElementById('notepad'),
    tracker: document.getElementById('tracker'),
    share: document.getElementById('share')
};

// Navigation with animation
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.remove('hidden');
            setTimeout(() => screen.style.opacity = 1, 0);
        } else {
            screen.style.opacity = 0;
            setTimeout(() => screen.classList.add('hidden'), 300);
        }
    });
}

// Home Screen
document.getElementById('newIdeaBtn').addEventListener('click', () => {
    currentIdea = {
        title: '',
        content: '',
        wins: [],
        progress: {
            problemDepth: 50,
            validation: 50,
            execution: 50
        },
        lastEdited: new Date()
    };
    document.getElementById('ideaTitle').value = '';
    document.getElementById('notepadContent').value = '';
    updateLastEdited();
    showScreen('notepad');
});

function updateIdeaList() {
    const ideaList = document.getElementById('ideaList');
    ideaList.innerHTML = '';
    ideas.forEach((idea, index) => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        const progress = Math.round((idea.progress.problemDepth + idea.progress.validation + idea.progress.execution) / 3);
        card.innerHTML = `
            <h3>${idea.title || 'Untitled Idea'}</h3>
            <p class="idea-meta">Last edited: ${formatDate(idea.lastEdited)}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <p class="progress-text">Progress: ${progress}%</p>
        `;
        card.addEventListener('click', () => {
            currentIdea = {...idea};
            document.getElementById('ideaTitle').value = idea.title;
            document.getElementById('notepadContent').value = idea.content;
            updateLastEdited();
            showScreen('notepad');
        });
        ideaList.appendChild(card);
    });
}

// Notepad Screen
function updateLastEdited() {
    currentIdea.lastEdited = new Date();
    document.querySelector('.idea-meta').textContent = `Last edited: ${formatDate(currentIdea.lastEdited)}`;
}

document.getElementById('ideaTitle').addEventListener('input', (e) => {
    currentIdea.title = e.target.value;
    updateLastEdited();
});

document.getElementById('notepadContent').addEventListener('input', (e) => {
    currentIdea.content = e.target.value;
    handleSlashCommands(e.target);
    updateLastEdited();
    
    // Auto-update progress based on content
    const content = e.target.value.toLowerCase();
    currentIdea.progress.problemDepth = calculateProgress(content, ['problem', 'challenge', 'issue', 'need', 'pain']);
    currentIdea.progress.validation = calculateProgress(content, ['validate', 'test', 'measure', 'metric', 'result']);
    currentIdea.progress.execution = calculateProgress(content, ['solution', 'implement', 'build', 'create', 'launch']);
});

function calculateProgress(content, keywords) {
    return Math.min(100, keywords.reduce((acc, keyword) => 
        acc + (content.includes(keyword) ? 20 : 0), 0));
}

function handleSlashCommands(textarea) {
    const cursorPosition = textarea.selectionStart;
    const content = textarea.value;
    const beforeCursor = content.substring(0, cursorPosition);
    const lastNewLine = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewLine + 1);

    if (currentLine.startsWith('/')) {
        const command = currentLine.trim();
        let template = '';

        switch (command) {
            case '/problem':
                template = '\n🎯 Problem Discovery:\n• What\'s the problem?\n• Who\'s affected?\n• Why does it matter?\n\n';
                break;
            case '/persona':
                template = '\n👤 Persona:\n• Who are they?\n• What do they need?\n• What are their pain points?\n\n';
                break;
            case '/validation':
                template = '\n✅ Validation Plan:\n• How will you test this?\n• What metrics matter?\n• Expected results?\n\n';
                break;
        }

        if (template) {
            const newContent = content.substring(0, cursorPosition - command.length) + 
                             template + 
                             content.substring(cursorPosition);
            textarea.value = newContent;
            currentIdea.content = newContent;
            
            // Animate the suggestions
            const suggestions = document.getElementById('suggestions');
            suggestions.style.transform = 'translateY(-10px)';
            suggestions.style.opacity = '0';
            setTimeout(() => {
                suggestions.textContent = '✨ Great! Keep building on your idea';
                suggestions.style.transform = 'translateY(0)';
                suggestions.style.opacity = '1';
            }, 300);
        }
    }
}

document.getElementById('trackProgressBtn').addEventListener('click', () => {
    updateRadarChart();
    showScreen('tracker');
});

document.getElementById('shareBtn').addEventListener('click', () => {
    showScreen('share');
});

// Grit Tracker Screen
let radarChart;

function updateRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    if (radarChart) {
        radarChart.destroy();
    }

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Problem Depth', 'Validation', 'Execution'],
            datasets: [{
                label: 'Idea Progress',
                data: [
                    currentIdea.progress.problemDepth,
                    currentIdea.progress.validation,
                    currentIdea.progress.execution
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 70, 229, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Update AI Score with animation
    const targetScore = Math.round((currentIdea.progress.problemDepth + 
                                  currentIdea.progress.validation + 
                                  currentIdea.progress.execution) / 3);
    const scoreElement = document.getElementById('aiScoreValue');
    const currentScore = parseInt(scoreElement.textContent);
    animateValue(scoreElement, currentScore, targetScore, 1000);
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
        } else {
            element.textContent = Math.round(current);
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

document.getElementById('addWinBtn').addEventListener('click', () => {
    const newWin = document.getElementById('newWin').value.trim();
    if (newWin) {
        currentIdea.wins.push({
            text: newWin,
            date: new Date()
        });
        updateWinsList();
        document.getElementById('newWin').value = '';
        
        // Celebrate the win
        celebrateWin();
    }
});

function celebrateWin() {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = '🎉';
    document.body.appendChild(celebration);
    
    setTimeout(() => celebration.remove(), 1000);
}

function updateWinsList() {
    const winsList = document.getElementById('winsList');
    winsList.innerHTML = '';
    currentIdea.wins.forEach(win => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="win-text">${win.text}</div>
            <div class="win-date">${formatDate(win.date)}</div>
        `;
        winsList.appendChild(li);
    });
}

// Share Screen
document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([currentIdea.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentIdea.title || 'untitled'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Show success message
    showToast('File exported successfully! 📄');
});

document.getElementById('copyLinkBtn').addEventListener('click', () => {
    // In a real app, this would generate a unique sharing link
    const demoLink = 'https://gritpad.app/share/' + Math.random().toString(36).substring(7);
    navigator.clipboard.writeText(demoLink);
    showToast('Share link copied! 🔗');
});

document.getElementById('sendInviteBtn').addEventListener('click', () => {
    const email = document.getElementById('inviteEmail').value;
    if (email) {
        console.log('Invite sent to:', email);
        showToast(`Invite sent to ${email} 📧`);
        document.getElementById('inviteEmail').value = '';
    }
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

function formatDate(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(date).toLocaleDateString();
}

// Navigation
document.getElementById('backToNotepadBtn').addEventListener('click', () => {
    showScreen('notepad');
});

document.getElementById('backToNotepadFromShare').addEventListener('click', () => {
    showScreen('notepad');
});

// Voice Input Functionality
let isRecording = false;
let recognition;

function setupVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            document.querySelectorAll('.voice-input-btn').forEach(btn => {
                btn.classList.add('active');
            });
            document.querySelector('.voice-input-overlay').classList.remove('hidden');
        };

        recognition.onend = () => {
            isRecording = false;
            document.querySelectorAll('.voice-input-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.voice-input-overlay').classList.add('hidden');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                const textarea = document.getElementById('notepadContent');
                const cursorPosition = textarea.selectionStart;
                const content = textarea.value;
                const newContent = content.substring(0, cursorPosition) + 
                                 finalTranscript + ' ' +
                                 content.substring(cursorPosition);
                textarea.value = newContent;
                textarea.selectionStart = cursorPosition + finalTranscript.length + 1;
                textarea.selectionEnd = textarea.selectionStart;
                
                // Trigger content analysis
                handleContentChange(textarea);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopVoiceInput();
        };
    }
}

function toggleVoiceInput() {
    if (!recognition) {
        setupVoiceInput();
    }

    if (isRecording) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    if (recognition) {
        recognition.start();
    }
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }
}

// Add voice input button event listeners
document.querySelectorAll('.voice-input-btn').forEach(btn => {
    btn.addEventListener('click', toggleVoiceInput);
});

// Enhanced content analysis
function handleContentChange(textarea) {
    const content = textarea.value.toLowerCase();
    
    // Update progress based on content
    currentIdea.progress.problemDepth = calculateProgress(content, [
        'problem', 'challenge', 'issue', 'need', 'pain',
        'market', 'customer', 'user', 'demand'
    ]);
    
    currentIdea.progress.validation = calculateProgress(content, [
        'validate', 'test', 'measure', 'metric', 'result',
        'experiment', 'hypothesis', 'data', 'feedback'
    ]);
    
    currentIdea.progress.execution = calculateProgress(content, [
        'solution', 'implement', 'build', 'create', 'launch',
        'timeline', 'milestone', 'resource', 'plan'
    ]);

    // Update last edited
    updateLastEdited();

    // Generate AI suggestions based on content
    generateAISuggestions(content);
}

function generateAISuggestions(content) {
    const suggestionList = document.querySelector('.suggestion-list');
    const suggestions = [];

    // Simple rule-based suggestions
    if (!content.includes('problem')) {
        suggestions.push('Try describing the core problem you\'re solving');
    }
    if (!content.includes('market') && !content.includes('size')) {
        suggestions.push('Consider adding market size estimates');
    }
    if (!content.includes('user') && !content.includes('customer')) {
        suggestions.push('Who are your target users?');
    }
    if (!content.includes('competition') && !content.includes('competitor')) {
        suggestions.push('Analyze your competition');
    }
    if (!content.includes('revenue') && !content.includes('monetization')) {
        suggestions.push('How will this idea generate revenue?');
    }

    // Update suggestion UI
    suggestionList.innerHTML = suggestions.slice(0, 3).map(suggestion => `
        <div class="suggestion-item">
            <i class="fas fa-magic"></i>
            <span>${suggestion}</span>
        </div>
    `).join('');
}

// Initialize voice input setup
setupVoiceInput();

// Initialize
updateIdeaList(); 