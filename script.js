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

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
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
        
        // Focus the textarea after transition
        setTimeout(() => {
            const textarea = document.getElementById('notepadContent');
            textarea.focus();
        }, 300);
    });

    // Notepad Screen
    const ideaTitle = document.getElementById('ideaTitle');
    const notepadContent = document.getElementById('notepadContent');
    const trackProgressBtn = document.getElementById('trackProgressBtn');
    const shareBtn = document.getElementById('shareBtn');

    // Ensure textarea is enabled and focusable
    notepadContent.removeAttribute('disabled');
    notepadContent.setAttribute('tabindex', '0');

    // Make editor content area clickable
    document.querySelector('.editor-content').addEventListener('click', (e) => {
        if (e.target.classList.contains('editor-content')) {
            notepadContent.focus();
        }
    });

    // Make editor wrapper clickable
    document.querySelector('.editor-wrapper').addEventListener('click', (e) => {
        if (e.target.classList.contains('editor-wrapper')) {
            notepadContent.focus();
        }
    });

    ideaTitle.addEventListener('input', (e) => {
        currentIdea.title = e.target.value;
        updateLastEdited();
    });

    notepadContent.addEventListener('input', (e) => {
        currentIdea.content = e.target.value;
        handleSlashCommands(e.target);
        updateLastEdited();
        updateProgress();
    });

    // Update voice input overlay handling
    const voiceInputOverlay = document.querySelector('.voice-input-overlay');
    if (voiceInputOverlay) {
        voiceInputOverlay.classList.remove('hidden');
        voiceInputOverlay.classList.add('show');
        voiceInputOverlay.style.display = 'none';
    }

    trackProgressBtn.addEventListener('click', () => {
        updateRadarChart();
        showScreen('tracker');
    });

    shareBtn.addEventListener('click', () => {
        showScreen('share');
    });

    // Template buttons
    document.querySelectorAll('.template-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            insertTemplate(template);
        });
    });

    // Suggestion cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const suggestion = card.querySelector('p').textContent;
            insertSuggestion(suggestion);
        });
    });

    // Voice input buttons
    document.querySelectorAll('.voice-input-btn').forEach(btn => {
        btn.addEventListener('click', toggleVoiceInput);
    });

    // Back buttons
    document.getElementById('backToNotepadBtn').addEventListener('click', () => {
        showScreen('notepad');
    });

    document.getElementById('backToNotepadFromShare').addEventListener('click', () => {
        showScreen('notepad');
    });

    // Share screen buttons
    document.getElementById('exportBtn').addEventListener('click', exportIdea);
    document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);
    document.getElementById('sendInviteBtn').addEventListener('click', sendInvite);

    // Wins section
    document.getElementById('addWinBtn').addEventListener('click', addWin);

    // Write/Structure mode toggle
    const writeBtn = document.querySelector('.tool-btn[title="Write Mode"]');
    const structureBtn = document.querySelector('.tool-btn[title="Structure Mode"]');
    
    writeBtn.addEventListener('click', () => {
        writeBtn.classList.add('active');
        structureBtn.classList.remove('active');
        document.querySelector('.editor-content').classList.remove('structure-mode');
    });
    
    structureBtn.addEventListener('click', () => {
        structureBtn.classList.add('active');
        writeBtn.classList.remove('active');
        document.querySelector('.editor-content').classList.add('structure-mode');
    });

    // AI Assistant button
    const aiAssistantBtn = document.querySelector('.tool-btn[title="AI Assistant"]');
    aiAssistantBtn.addEventListener('click', () => {
        const suggestions = [
            "Consider adding more details about the target market",
            "What specific metrics will you track?",
            "How will you validate this with users?",
            "What's the timeline for implementation?"
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        insertSuggestion(randomSuggestion);
        showToast('AI Suggestion Added! 🤖');
    });

    // View options toggle
    const gridViewBtn = document.querySelector('.view-options button:first-child');
    const listViewBtn = document.querySelector('.view-options button:last-child');
    const ideaList = document.getElementById('ideaList');
    
    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        ideaList.classList.remove('list-view');
        ideaList.classList.add('idea-grid');
    });
    
    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        ideaList.classList.remove('idea-grid');
        ideaList.classList.add('list-view');
    });
});

// Helper functions
function updateLastEdited() {
    currentIdea.lastEdited = new Date();
    document.querySelector('.idea-meta').textContent = `Last edited: ${formatDate(currentIdea.lastEdited)}`;
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
            updateProgress();
        }
    }
}

function insertTemplate(template) {
    const textarea = document.getElementById('notepadContent');
    const cursorPosition = textarea.selectionStart;
    const content = textarea.value;
    let templateText = '';

    switch (template) {
        case 'problem':
            templateText = '\n🎯 Problem Discovery:\n• What\'s the problem?\n• Who\'s affected?\n• Why does it matter?\n\n';
            break;
        case 'persona':
            templateText = '\n👤 Persona:\n• Who are they?\n• What do they need?\n• What are their pain points?\n\n';
            break;
        case 'validation':
            templateText = '\n✅ Validation Plan:\n• How will you test this?\n• What metrics matter?\n• Expected results?\n\n';
            break;
    }

    const newContent = content.substring(0, cursorPosition) + templateText + content.substring(cursorPosition);
    textarea.value = newContent;
    currentIdea.content = newContent;
    updateProgress();
    textarea.focus();
}

function insertSuggestion(suggestion) {
    const textarea = document.getElementById('notepadContent');
    const cursorPosition = textarea.selectionStart;
    const content = textarea.value;
    const newContent = content.substring(0, cursorPosition) + '\n💡 ' + suggestion + '\n' + content.substring(cursorPosition);
    textarea.value = newContent;
    currentIdea.content = newContent;
    updateProgress();
    textarea.focus();
}

function updateProgress() {
    const content = document.getElementById('notepadContent').value.toLowerCase();
    
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
}

function calculateProgress(content, keywords) {
    return Math.min(100, keywords.reduce((acc, keyword) => 
        acc + (content.includes(keyword) ? 20 : 0), 0));
}

function updateRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    if (window.radarChart) {
        window.radarChart.destroy();
    }

    window.radarChart = new Chart(ctx, {
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
                backgroundColor: 'rgba(0, 229, 190, 0.2)',
                borderColor: 'rgba(0, 229, 190, 1)',
                pointBackgroundColor: 'rgba(0, 229, 190, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 229, 190, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: '#FFFFFF',
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

    const aiScore = Math.round(
        (currentIdea.progress.problemDepth + 
         currentIdea.progress.validation + 
         currentIdea.progress.execution) / 3
    );
    
    animateValue(document.getElementById('aiScoreValue'), 0, aiScore, 1000);
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

function addWin() {
    const newWin = document.getElementById('newWin').value.trim();
    if (newWin) {
        currentIdea.wins.push({
            text: newWin,
            date: new Date()
        });
        updateWinsList();
        document.getElementById('newWin').value = '';
        showToast('Win added! 🎉');
    }
}

function updateWinsList() {
    const winsList = document.getElementById('winsList');
    winsList.innerHTML = currentIdea.wins.map(win => `
        <li>
            <div class="win-text">${win.text}</div>
            <div class="win-date">${formatDate(win.date)}</div>
        </li>
    `).join('');
}

function exportIdea() {
    const blob = new Blob([
        `${currentIdea.title}\n\n${currentIdea.content}`,
        { type: 'text/plain' }
    ]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentIdea.title || 'untitled'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Idea exported successfully! 📄');
}

function copyShareLink() {
    const shareLink = `https://gritpad.app/share/${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(shareLink);
    showToast('Share link copied! 🔗');
}

function sendInvite() {
    const email = document.getElementById('inviteEmail').value.trim();
    if (email) {
        showToast(`Invite sent to ${email} 📧`);
        document.getElementById('inviteEmail').value = '';
    }
}

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

// Voice Input Setup
let recognition;
let isRecording = false;

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
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
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
                currentIdea.content = newContent;
                updateProgress();
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

// Initialize
setupVoiceInput();
updateIdeaList(); 