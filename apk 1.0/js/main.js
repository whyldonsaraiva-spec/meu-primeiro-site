// Application Initialization & Event Binding

const Application = {
    updateWeather() {
        const weatherWidget = document.getElementById('weatherWidget');
        if (!weatherWidget) return;
        const icons = ['☀️', '🌤️', '⛅', '🌥️', '🌦️'];
        const iconsMap = { '☀️': 'Ensolarado', '🌤️': 'Parcialmente Nublado', '⛅': 'Nublado', '🌥️': 'Muito Nublado', '🌦️': 'Chuva Fraca' };
        const rand = Math.floor(Math.random() * icons.length);
        weatherWidget.innerHTML = `${icons[rand]} 24°C — ${iconsMap[icons[rand]]}`;
    },

    applyTheme(theme) {
        AppState.currentTheme = theme;
        AppState.sync('currentTheme');
        if (theme === 'system') {
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'white');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
        if (window.Components && Components.updateChart) Components.updateChart();
    },

    applyLayout(layout) {
        AppState.currentLayout = layout;
        AppState.sync('currentLayout');
        document.body.setAttribute('data-layout', layout);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAVEGAÇÃO ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            
            document.getElementById(targetId)?.classList.add('active');
            btn.classList.add('active');

            if (targetId === 'checklistTab' || targetId === 'progressTab') Components.updateChart();
            if (targetId === 'habitsTab') Components.renderHabits();
        });
    });

    // --- COFRE (LOCK SCREEN) ---
    if (AppState.userPIN) {
        const lockScreen = document.getElementById('lockScreen');
        const unlockBtn = document.getElementById('unlockBtn');
        const pinInput = document.getElementById('pinInput');
        
        lockScreen.classList.remove('hidden');
        
        unlockBtn.addEventListener('click', () => {
            if (pinInput.value === AppState.userPIN) {
                lockScreen.classList.add('hidden');
                pinInput.value = '';
            } else {
                document.getElementById('pinError').style.display = 'block';
            }
        });
    }

    // --- DASHBOARD ACTIONS ---
    document.getElementById('editQuoteBtn')?.addEventListener('click', async () => {
        const res = await Utils.CustomModal.prompt("Digite sua nova frase motivacional:", AppState.customQuote);
        if (res !== null && res.trim() !== '') {
            AppState.customQuote = res.trim();
            AppState.sync('customQuote');
            document.dispatchEvent(new Event('app:updateDashboard'));
        }
    });

    // --- FORMS ---
    document.getElementById('taskForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const t = document.getElementById('taskInput').value.trim();
        const p = document.getElementById('taskPriority').value;
        if (t) {
            Components.addTask(t, p);
            document.getElementById('taskInput').value = '';
        }
    });

    document.getElementById('habitForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const h = document.getElementById('habitInput').value.trim();
        if (h) {
            AppState.habits.push({ id: Date.now(), text: h, history: {} });
            AppState.sync('habits');
            Components.renderHabits();
            document.dispatchEvent(new Event('app:updateDashboard'));
            document.getElementById('habitInput').value = '';
        }
    });

    document.getElementById('shortcutForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let name = document.getElementById('shortcutNameInput').value.trim();
        let url = document.getElementById('shortcutUrlInput').value.trim();
        if (name && url) {
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            AppState.shortcuts.push({ id: Date.now(), name, url });
            AppState.sync('shortcuts');
            Components.renderShortcuts();
            document.getElementById('shortcutNameInput').value = '';
            document.getElementById('shortcutUrlInput').value = '';
        }
    });

    // --- NOTES ---
    document.getElementById('newFolderBtn')?.addEventListener('click', async () => {
        const name = await Utils.CustomModal.prompt("Nome da nova pasta:");
        if (name && name.trim()) {
            AppState.folders.push({ id: Date.now(), name: name.trim() });
            AppState.sync('folders');
            Components.renderFolders();
        }
    });

    document.getElementById('newNoteBtn')?.addEventListener('click', () => {
        const note = { id: Date.now(), folderId: AppState.currentFolderId, title: "Nova Nota", content: "" };
        AppState.notes.push(note);
        AppState.sync('notes');
        Components.renderNotes();
        Components.openNote(note.id);
    });

    document.getElementById('saveNoteBtn')?.addEventListener('click', async () => {
        const note = AppState.notes.find(n => n.id === AppState.currentNoteId);
        if (note) {
            note.title = document.getElementById('noteTitle').value;
            note.content = document.getElementById('noteText').innerHTML;
            const mf = document.getElementById('moveFolderSelect');
            if (mf) note.folderId = parseInt(mf.value);
            AppState.sync('notes');
            if (note.folderId !== AppState.currentFolderId) Components.toggleEditor(false);
            Components.renderNotes();
            await Utils.CustomModal.alert("Nota salva!");
        }
    });

    document.getElementById('deleteNoteBtn')?.addEventListener('click', async () => {
        if(await Utils.CustomModal.confirm("Excluir esta nota?")) {
            AppState.notes = AppState.notes.filter(n => n.id !== AppState.currentNoteId);
            AppState.currentNoteId = null;
            AppState.sync('notes');
            Components.renderNotes();
            Components.toggleEditor(false);
        }
    });

    // --- SETTINGS ---
    document.getElementById('openSettingsBtn')?.addEventListener('click', () => document.getElementById('settingsModal').classList.remove('hidden'));
    document.getElementById('closeSettingsBtn')?.addEventListener('click', () => document.getElementById('settingsModal').classList.add('hidden'));

    document.getElementById('themeSelect')?.addEventListener('change', (e) => Application.applyTheme(e.target.value));
    document.getElementById('layoutSelect')?.addEventListener('change', (e) => Application.applyLayout(e.target.value));
    
    document.getElementById('emojiToggleBtn')?.addEventListener('change', (e) => {
        AppState.emojisEnabled = e.target.checked;
        AppState.sync('emojisEnabled');
        document.body.classList.toggle('no-emojis', !AppState.emojisEnabled);
        Components.renderTasks(); Components.renderFolders(); 
        Components.renderNotes(); Components.renderShortcuts(); Components.renderHabits();
        document.dispatchEvent(new Event('app:updateDashboard'));
    });

    document.getElementById('savePinBtn')?.addEventListener('click', () => {
        const p = document.getElementById('pinSettingsInput').value.trim();
        if (p.length === 0) { localStorage.removeItem('userPIN'); AppState.userPIN = null; alert('Cofre desativado.'); }
        else if (p.length === 4) { localStorage.setItem('userPIN', p); AppState.userPIN = p; alert('PIN salvo!'); }
        else { alert('O PIN precisa ter 4 dígitos.'); }
    });

    document.getElementById('resetAllBtn')?.addEventListener('click', async () => {
        if(await Utils.CustomModal.confirm("🚨 APAGAR TUDO PERMANENTEMENTE?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // --- AUDIO & FORMATTING ---
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.execCommand(btn.getAttribute('data-format'), false, null);
            document.getElementById('noteText')?.focus();
        });
    });

    let mediaRecorder = null;
    document.getElementById('recordAudioBtn')?.addEventListener('click', async () => {
        const rBtn = document.getElementById('recordAudioBtn');
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                const chunks = [];
                rBtn.style.color = "red";
                rBtn.innerHTML = "⏹️ Parar";
                mediaRecorder.ondataavailable = e => chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const noteText = document.getElementById('noteText');
                        if (noteText) {
                            noteText.innerHTML += `<br><audio controls src="${reader.result}"></audio><br>`;
                            const note = AppState.notes.find(n => n.id === AppState.currentNoteId);
                            if (note) { note.content = noteText.innerHTML; AppState.sync('notes'); }
                        }
                    };
                    stream.getTracks().forEach(t => t.stop());
                    mediaRecorder = null;
                };
            } catch (e) { alert("Erro ao acessar microfone."); }
        } else {
            mediaRecorder.stop();
            rBtn.style.color = "";
            rBtn.innerHTML = "🎤 Gravar Áudio";
        }
    });

    // --- SEARCH ---
    const searchInp = document.getElementById('searchInput');
    searchInp?.addEventListener('input', Utils.debounce((e) => {
        const q = e.target.value.toLowerCase();
        const results = document.getElementById('searchResults');
        results.innerHTML = '';
        if(!q) return;
        AppState.tasks.filter(t => !t.completed && t.text.toLowerCase().includes(q))
            .forEach(t => results.innerHTML += `<li class="p-10 border-bottom">✅ Tarefa: ${Utils.escapeHTML(t.text)}</li>`);
        AppState.notes.filter(n => n.title?.toLowerCase().includes(q))
            .forEach(n => results.innerHTML += `<li class="p-10 border-bottom cursor-pointer" onclick="document.getElementById('searchModal').classList.add('hidden'); document.querySelector('.tab-btn[data-tab=\\'notesTab\\']').click(); Components.openNote(${n.id});">📄 Nota: ${Utils.escapeHTML(n.title)}</li>`);
    }, 300));

    // --- EVENTS & INIT ---
    document.addEventListener('app:updateDashboard', () => {
        const h = new Date().getHours();
        let g = h < 12 ? "Bom dia!" : h < 18 ? "Boa tarde!" : "Boa noite!";
        const wText = document.getElementById('welcomeText');
        if(wText) wText.innerHTML = `${g} ${AppState.emojisEnabled ? '🚀' : ''} Pronto para evoluir?`;
        
        document.getElementById('dailyQuote').textContent = AppState.customQuote;
        
        const hpList = document.getElementById('highPriorityList');
        if (hpList) {
            hpList.innerHTML = '';
            const today = Utils.getLocalISOString();
            const items = AppState.tasks.filter(t => t.date === today && t.priority === 'high' && !t.completed)
                .map(t => `<li class="task-item border-l-red p-10">${AppState.emojisEnabled?'🔴':''} ${Utils.escapeHTML(t.text)}</li>`);
            AppState.habits.filter(h => !h.history || !h.history[today])
                .forEach(h => items.push(`<li class="task-item border-l-accent p-10">${AppState.emojisEnabled?'🧬':''} ${Utils.escapeHTML(h.text)}</li>`));
            hpList.innerHTML = items.length ? items.join('') : '<p class="text-muted w-full text-center">Tudo em dia!</p>';
        }
    });

    document.addEventListener('app:xpChanged', () => {
        const badge = document.getElementById('xpBadge');
        if(badge) {
            badge.textContent = `Nível ${Math.floor(AppState.userXP / 100) + 1} (${AppState.userXP} XP)`;
            badge.style.display = AppState.gamificationEnabled ? 'inline-block' : 'none';
        }
    });

    setInterval(() => {
        const clock = document.getElementById('digitalClock');
        if(clock) clock.textContent = new Date().toLocaleTimeString('pt-BR');
    }, 1000);

    // Final Init
    Application.applyTheme(AppState.currentTheme);
    Application.applyLayout(AppState.currentLayout);
    Application.updateWeather();
    
    document.getElementById('viewDate').value = Utils.getLocalISOString();
    Components.renderFolders();
    Components.renderNotes();
    Components.renderShortcuts();
    Components.renderHabits();
    Components.renderTasks();
    Components.updateChart();
    
    document.dispatchEvent(new Event('app:updateDashboard'));
    document.dispatchEvent(new Event('app:xpChanged'));
    
    document.getElementById('startAppBtn')?.addEventListener('click', () => {
        document.getElementById('splashScreen').classList.add('hidden');
        localStorage.setItem('appStarted', 'true');
    });
    if (localStorage.getItem('appStarted') === 'true') document.getElementById('splashScreen').classList.add('hidden');
});
