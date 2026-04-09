// Application Initialization & Event Binding

document.addEventListener('DOMContentLoaded', () => {
    
    // Theme & Layout Applicators
    const applyTheme = (theme) => {
        AppState.currentTheme = theme;
        AppState.sync('currentTheme');
        const root = document.documentElement;
        if (theme === 'system') {
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'white');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
        Components.updateChart();
    };

    const applyLayout = (layout) => {
        AppState.currentLayout = layout;
        AppState.sync('currentLayout');
        document.body.setAttribute('data-layout', layout);
    };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            
            const target = btn.getAttribute('data-tab');
            document.getElementById(target)?.classList.add('active');
            btn.classList.add('active');

            if (target === 'checklistTab' || target === 'progressTab') Components.updateChart();
            if (target === 'habitsTab') Components.renderHabits();
        });
    });

    const openTab = (id) => {
        document.querySelector(`.tab-btn[data-tab="${id}"]`)?.click();
    };

    // Dashboard Custom Bindings
    if (localStorage.getItem('appStarted') !== 'true') {
        document.getElementById('splashScreen')?.classList.remove('hidden');
    } else {
        document.getElementById('splashScreen')?.classList.add('hidden');
    }

    document.getElementById('startAppBtn')?.addEventListener('click', () => {
        document.getElementById('splashScreen').classList.add('hidden');
        localStorage.setItem('appStarted', 'true');
    });

    document.getElementById('goHomeBtn')?.addEventListener('click', () => {
        document.getElementById('splashScreen').classList.remove('hidden');
        localStorage.removeItem('appStarted');
    });

    document.getElementById('editQuoteBtn')?.addEventListener('click', async () => {
        const res = await Utils.CustomModal.prompt("Digite sua nova frase motivacional:", AppState.customQuote);
        if (res !== null && res.trim() !== '') {
            AppState.customQuote = res.trim();
            AppState.sync('customQuote');
            document.dispatchEvent(new Event('app:updateDashboard'));
        }
    });

    // Forms
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

    // Notes Handlers
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
            if (note.folderId !== AppState.currentFolderId) {
                Components.toggleEditor(false);
            }
            Components.renderNotes();
            await Utils.CustomModal.alert("Nota salva com sucesso!");
        }
    });

    document.getElementById('deleteNoteBtn')?.addEventListener('click', async () => {
        if(await Utils.CustomModal.confirm("Deseja realmente excluir esta nota?")) {
            AppState.notes = AppState.notes.filter(n => n.id !== AppState.currentNoteId);
            AppState.currentNoteId = null;
            AppState.sync('notes');
            Components.renderNotes();
            Components.toggleEditor(false);
        }
    });

    // Formatting Note using standard execCommand wrapper via CSS replacement or fallback
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.getAttribute('data-format');
            // Though deprecated, execCommand is standard for simple contenteditables without big libraries 
            document.execCommand(format, false, null);
            document.getElementById('noteText')?.focus();
        });
    });

    // Audio Memos - Patching memory leak
    let mediaRecorder = null;
    let streamRef = null;
    let audioChunks = [];
    const rBtn = document.getElementById('recordAudioBtn');
    
    if (rBtn) {
        rBtn.addEventListener('click', async () => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                try {
                    streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(streamRef);
                    mediaRecorder.start();
                    audioChunks = [];
                    rBtn.style.color = "red";
                    rBtn.innerHTML = "⏹️ Parar";

                    mediaRecorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
                    
                    mediaRecorder.addEventListener("stop", () => {
                        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        reader.onloadend = () => {
                            const noteText = document.getElementById('noteText');
                            if (noteText) {
                                noteText.innerHTML += `<br><audio controls src="${reader.result}" class="audio-el"></audio><br>`;
                                const note = AppState.notes.find(n => n.id === AppState.currentNoteId);
                                if (note) { note.content = noteText.innerHTML; AppState.sync('notes'); }
                            }
                        };
                        streamRef.getTracks().forEach(t => t.stop());
                        mediaRecorder = null;
                        streamRef = null;
                    });
                } catch (e) { await Utils.CustomModal.alert("Erro ao acessar o microfone."); }
            } else {
                mediaRecorder.stop();
                rBtn.style.color = "";
                rBtn.innerHTML = "🎤 Gravar Áudio";
            }
        });
    }

    // Settings Modal
    document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
    });
    document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('themeSelect')?.addEventListener('change', (e) => applyTheme(e.target.value));
    document.getElementById('layoutSelect')?.addEventListener('change', (e) => applyLayout(e.target.value));
    
    document.getElementById('emojiToggleBtn')?.addEventListener('change', (e) => {
        AppState.emojisEnabled = e.target.checked;
        AppState.sync('emojisEnabled');
        document.body.classList.toggle('no-emojis', !AppState.emojisEnabled);
        Components.renderTasks(); Components.renderFolders(); Components.renderNotes();
        Components.renderShortcuts(); Components.renderHabits();
        document.dispatchEvent(new Event('app:updateDashboard'));
    });

    document.getElementById('resetAllBtn')?.addEventListener('click', async () => {
        if(await Utils.CustomModal.confirm("🚨 ATENÇÃO: Deseja apagar TUDO permanentemente?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Search Universal
    const uSearchObj = document.getElementById('searchModal');
    const uSearchInp = document.getElementById('searchInput');
    const uSearchRes = document.getElementById('searchResults');
    
    const showSearch = () => { uSearchObj?.classList.remove('hidden'); uSearchInp?.focus(); };
    const hideSearch = () => { uSearchObj?.classList.add('hidden'); };
    
    document.getElementById('openSearchBtn')?.addEventListener('click', showSearch);
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') { e.preventDefault(); showSearch(); }
        if (e.key === 'Escape') hideSearch();
    });

    uSearchInp?.addEventListener('input', Utils.debounce((e) => {
        const q = e.target.value.toLowerCase();
        uSearchRes.innerHTML = '';
        if(!q) return;

        let res = [];
        AppState.tasks.filter(t => !t.completed && t.text.toLowerCase().includes(q))
            .forEach(t => res.push(`<li class="p-10 border-bottom">✅ Tarefa: ${Utils.escapeHTML(t.text)}</li>`));
        AppState.notes.filter(n => (n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)))
            .forEach(n => res.push(`<li class="p-10 border-bottom cursor-pointer" onclick="document.getElementById('searchModal').classList.add('hidden'); document.querySelector('.tab-btn[data-tab=\\'notesTab\\']').click(); Components.openNote(${n.id});">📄 Nota: ${Utils.escapeHTML(n.title)}</li>`));
        
        uSearchRes.innerHTML = res.join('');
    }, 300));


    // Pomodoro Timer
    let pomoInterval = null;
    let pomoTimeTotal = 25 * 60;
    let pomoTimeLeft = pomoTimeTotal;
    
    const updatePomo = () => {
        document.getElementById('pomoMinutes').textContent = String(Math.floor(pomoTimeLeft / 60)).padStart(2, '0');
        document.getElementById('pomoSeconds').textContent = String(pomoTimeLeft % 60).padStart(2, '0');
    };
    
    document.querySelectorAll('.pomo-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            clearInterval(pomoInterval); pomoInterval = null;
            const min = parseInt(btn.getAttribute('data-pomo'));
            pomoTimeTotal = min * 60;
            pomoTimeLeft = pomoTimeTotal;
            document.getElementById('pomoStatus').textContent = min === 25 ? "Modo Foco" : "Pausa";
            updatePomo();
        });
    });

    document.getElementById('startPomoBtn')?.addEventListener('click', () => {
        if(pomoInterval) return;
        pomoInterval = setInterval(() => {
            pomoTimeLeft--; updatePomo();
            if(pomoTimeLeft <= 0) {
                clearInterval(pomoInterval); pomoInterval = null;
                AppState.addXP(25);
                Utils.CustomModal.alert("Tempo esgotado! Você ganhou 25 XP!");
                pomoTimeLeft = pomoTimeTotal; updatePomo();
            }
        }, 1000);
    });

    document.getElementById('pausePomoBtn')?.addEventListener('click', () => { clearInterval(pomoInterval); pomoInterval = null; });
    document.getElementById('resetPomoBtn')?.addEventListener('click', () => { clearInterval(pomoInterval); pomoInterval = null; pomoTimeLeft = pomoTimeTotal; updatePomo(); });

    // Custom Event Listeners for Dashboard
    document.addEventListener('app:updateDashboard', () => {
        const welcome = document.getElementById('welcomeText');
        if (welcome) {
            const h = new Date().getHours();
            let g = "Boa noite!", em = "🌙";
            if (h >= 5 && h < 12) { g = "Bom dia!"; em = "☀️"; }
            else if (h >= 12 && h < 18) { g = "Boa tarde!"; em = "☕"; }
            welcome.innerHTML = `${g} ${AppState.emojisEnabled ? `<span class="emoji">${em}</span>` : ""} Pronto para evoluir?`;
        }

        const dQuote = document.getElementById('dailyQuote');
        if(dQuote) dQuote.textContent = AppState.customQuote;

        const hpList = document.getElementById('highPriorityList');
        if (hpList) {
            hpList.innerHTML = '';
            const todayStr = Utils.getLocalISOString();
            const hToday = AppState.tasks.filter(t => t.date === todayStr && t.priority === 'high' && !t.completed);
            const pHabits = AppState.habits.filter(h => !h.history || !h.history[todayStr]);

            let items = [];
            hToday.forEach(t => items.push(`<li class="task-item border-l-red p-10 cursor-pointer" onclick="document.querySelector('.tab-btn[data-tab=\\'checklistTab\\']').click(); document.getElementById('viewDate').value='${t.date}'; Components.renderTasks();">${AppState.emojisEnabled?'🔴':'<b>[Alta]</b>'} ${Utils.escapeHTML(t.text)}</li>`));
            pHabits.forEach(h => items.push(`<li class="task-item border-l-accent p-10 cursor-pointer" onclick="document.querySelector('.tab-btn[data-tab=\\'habitsTab\\']').click();">${AppState.emojisEnabled?'🧬':'<b>[Hábito]</b>'} ${Utils.escapeHTML(h.text)}</li>`));

            if(items.length > 0) hpList.innerHTML = items.join('');
            else hpList.innerHTML = `<p class="text-muted w-full text-center">Nenhuma pendente! ${AppState.emojisEnabled?'🎉':''}</p>`;
        }
        
        const ySum = document.getElementById('yesterdaySummary');
        if(ySum) {
            const y = new Date(); y.setDate(y.getDate() - 1);
            const yKey = Utils.getLocalISOString(y);
            const yT = AppState.tasks.filter(t => t.date === yKey);
            const done = yT.filter(t => t.completed).length;
            if(yT.length === 0) ySum.textContent = "Nenhuma tarefa registrada ontem.";
            else ySum.textContent = `Ontem você completou ${done}/${yT.length} tarefas (${Math.round(done/yT.length*100)}%).`;
        }
    });

    document.addEventListener('app:xpChanged', () => {
        const badge = document.getElementById('xpBadge');
        if(badge) {
            let level = Math.floor(AppState.userXP / 100) + 1;
            badge.textContent = `Nível ${level} (${AppState.userXP} XP)`;
            badge.style.display = AppState.gamificationEnabled ? 'inline-block' : 'none';
        }
    });

    // Chart Events
    document.getElementById('reportPeriod')?.addEventListener('change', (e) => {
        document.getElementById('customRange')?.classList.toggle('hidden', e.target.value !== 'custom');
        Components.updateChart();
    });
    document.getElementById('chartType')?.addEventListener('change', Components.updateChart);
    document.getElementById('startDate')?.addEventListener('change', Components.updateChart);
    document.getElementById('endDate')?.addEventListener('change', Components.updateChart);
    document.getElementById('viewDate')?.addEventListener('change', () => { Components.renderTasks(); Components.updateChart(); });

    // INIT
    setInterval(() => {
        const d = document.getElementById('digitalClock');
        if(d) d.textContent = new Date().toLocaleTimeString('pt-BR');
    }, 1000);
    
    applyTheme(AppState.currentTheme);
    applyLayout(AppState.currentLayout);
    document.dispatchEvent(new Event('app:xpChanged'));
    Components.renderFolders();
    Components.renderNotes();
    Components.renderShortcuts();
    Components.renderHabits();
    document.getElementById('viewDate').value = Utils.getLocalISOString();
    Components.renderTasks();
    Components.updateChart();
    document.dispatchEvent(new Event('app:updateDashboard'));
    
    // Quick Actions
    document.getElementById('quickTaskBtn')?.addEventListener('click', () => { openTab('checklistTab'); document.getElementById('taskInput')?.focus(); });
    document.getElementById('quickNoteBtn')?.addEventListener('click', () => { openTab('notesTab'); document.getElementById('newNoteBtn')?.click(); });
    document.getElementById('quickFocusBtn')?.addEventListener('click', () => openTab('focusTab'));
    document.getElementById('quickSettingsBtn')?.addEventListener('click', () => document.getElementById('openSettingsBtn')?.click());
});
