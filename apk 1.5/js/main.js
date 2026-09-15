// --- INICIALIZAÇÃO DA APLICAÇÃO E LISTENERS DE EVENTOS (main.js) ---

document.addEventListener('DOMContentLoaded', () => {

    // Configura data inicial como "Hoje"
    const today = new Date().toISOString().split('T')[0];
    if (viewDateInput) viewDateInput.value = today;

    if (gridToggleBtn) gridToggleBtn.checked = gridsEnabled;

    // Exportar e Importar Backup
    if (exportDataBtn) exportDataBtn.addEventListener('click', () => {
        const data = {
            tasks, folders, notes, shortcuts, habits,
            settings: { currentTheme, currentLayout, gamificationEnabled, emojisEnabled, gridsEnabled }
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `next_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });

    if (importDataInput) importDataInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (confirm("Isso irá substituir todos os seus dados atuais. Continuar?")) {
                    if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
                    if (data.folders) localStorage.setItem('folders', JSON.stringify(data.folders));
                    if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
                    if (data.shortcuts) localStorage.setItem('shortcuts', JSON.stringify(data.shortcuts));
                    if (data.habits) localStorage.setItem('habits', JSON.stringify(data.habits));
                    if (data.settings) {
                        if (data.settings.currentTheme) localStorage.setItem('theme', data.settings.currentTheme);
                        if (data.settings.currentLayout) localStorage.setItem('layout', data.settings.currentLayout);
                    }
                    alert("Dados importados com sucesso! A página será recarregada.");
                    location.reload();
                }
            } catch (err) {
                alert("Arquivo inválido!");
            }
        };
        reader.readAsText(file);
    });

    // Gravação de Áudio Memos
    if (recordAudioBtn) {
        recordAudioBtn.addEventListener('click', async () => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    audioChunks = [];
                    recordAudioBtn.style.color = "red";
                    recordAudioBtn.innerHTML = "⏹️ Parar";

                    mediaRecorder.addEventListener("dataavailable", event => {
                        audioChunks.push(event.data);
                    });

                    mediaRecorder.addEventListener("stop", () => {
                        const audioType = mediaRecorder.mimeType ? mediaRecorder.mimeType : 'audio/webm';
                        const audioBlob = new Blob(audioChunks, { type: audioType });
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        reader.onloadend = () => {
                            const base64Audio = reader.result;
                            const audioHTML = `<br><audio controls src="${base64Audio}" style="height:40px; border-radius: 8px;"></audio><br>`;
                            if (noteTextInput) {
                                noteTextInput.innerHTML += audioHTML;
                                const note = notes.find(n => n.id === currentNoteId);
                                if (note) {
                                    note.content = noteTextInput.innerHTML;
                                    saveNotes();
                                }
                            }
                        };
                        stream.getTracks().forEach(track => track.stop());
                    });
                } catch (e) { alert("Erro ao acessar o microfone."); }
            } else {
                mediaRecorder.stop();
                recordAudioBtn.style.color = "";
                recordAudioBtn.innerHTML = "🎤 Gravar Áudio";
            }
        });
    }

    // Configurações & Controles
    if (langSelect) {
        langSelect.value = currentLanguage;
        langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }
    if (themeSelect) themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    if (layoutSelect) layoutSelect.addEventListener('change', (e) => applyLayout(e.target.value));
    if (viewDateInput) viewDateInput.addEventListener('change', () => { renderTasks(); if (reportPeriodSelect && reportPeriodSelect.value === 'daily') updateChart(); });
    if (reportPeriodSelect) reportPeriodSelect.addEventListener('change', (e) => {
        if (customRangeDiv) customRangeDiv.classList.toggle('hidden', e.target.value !== 'custom');
        updateChart();
    });
    if (chartTypeSelect) chartTypeSelect.addEventListener('change', () => {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        updateChart();
    });
    if (startDateInput) startDateInput.addEventListener('change', updateChart);
    if (endDateInput) endDateInput.addEventListener('change', updateChart);
    if (addTaskBtn) addTaskBtn.addEventListener('click', () => { addTask(); updateDashboard(); });
    if (taskInput) taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { addTask(); updateDashboard(); } });

    // Eventos de Atalhos
    if (addShortcutBtn) addShortcutBtn.addEventListener('click', addShortcut);
    if (shortcutNameInput) shortcutNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addShortcut(); });
    if (shortcutUrlInput) shortcutUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addShortcut(); });

    // Splash Screen
    if (startAppBtn) startAppBtn.addEventListener('click', () => {
        if (splashScreen) splashScreen.classList.add('splash-hidden');
        localStorage.setItem('appStarted', 'true');
    });

    // Modal de Configurações
    if (openSettingsBtn) openSettingsBtn.addEventListener('click', () => {
        if (settingsModal) settingsModal.classList.remove('hidden');
    });
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => {
        if (settingsModal) settingsModal.classList.add('hidden');
    });
    if (resetAllBtn) resetAllBtn.addEventListener('click', () => {
        if (confirm("🚨 ATENÇÃO: Deseja apagar todas as tarefas, pastas, notas e atalhos permanentemente?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Inicialização do Splash Screen
    if (localStorage.getItem('appStarted') === 'true' && splashScreen) {
        splashScreen.classList.add('splash-hidden');
    }

    if (customQuoteInput) {
        customQuoteInput.value = customQuote !== '"Ação é a chave fundamental para todo sucesso."' ? customQuote : "";
        customQuoteInput.addEventListener('input', (e) => {
            customQuote = e.target.value.trim() || '"Ação é a chave fundamental para todo sucesso."';
            localStorage.setItem('customQuote', customQuote);
            updateDashboard();
        });
    }

    if (emojiToggleBtn) {
        emojiToggleBtn.checked = emojisEnabled;
        emojiToggleBtn.addEventListener('change', (e) => {
            emojisEnabled = e.target.checked;
            localStorage.setItem('emojisEnabled', JSON.stringify(emojisEnabled));
            if (!emojisEnabled) document.body.classList.add('no-emojis');
            else document.body.classList.remove('no-emojis');
            renderTasks();
            renderFolders();
            renderNotes();
            renderShortcuts();
            renderHabits();
            updateDashboard();
        });
    }
    if (!emojisEnabled) document.body.classList.add('no-emojis');

    if (gamificationToggleBtn) {
        gamificationToggleBtn.checked = gamificationEnabled;
        gamificationToggleBtn.addEventListener('change', (e) => {
            gamificationEnabled = e.target.checked;
            localStorage.setItem('gamificationEnabled', JSON.stringify(gamificationEnabled));
            updateXP();
        });
    }

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (themeSelect && themeSelect.value === 'system') {
                document.body.setAttribute('data-theme', e.matches ? 'dark' : 'white');
                if (progressChart) updateChart();
            }
        });
    }

    // Busca Universal
    if (openSearchBtn) openSearchBtn.addEventListener('click', () => {
        if (searchModal) {
            searchModal.classList.remove('hidden');
            if (searchInput) searchInput.focus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            if (searchModal) {
                searchModal.classList.remove('hidden');
                if (searchInput) searchInput.focus();
            }
        }
        if (e.key === 'Escape') {
            if (searchModal) searchModal.classList.add('hidden');
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            if (!searchResults) return;
            searchResults.innerHTML = '';
            if (!q) return;

            let res = [];
            tasks.filter(t => t.text.toLowerCase().includes(q) && !t.completed).forEach(t => res.push(`<li>✅ Tarefa: ${t.text}</li>`));
            notes.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q))).forEach(n => res.push(`<li style="cursor:pointer;" onclick="if(searchModal) searchModal.classList.add('hidden'); openTab(null, 'notesTab'); openNote(${n.id});">📄 Nota: ${n.title}</li>`));
            shortcuts.filter(s => s.name.toLowerCase().includes(q)).forEach(s => res.push(`<li>🔗 Atalho: <a href="${s.url}" target="_blank">${s.name}</a></li>`));

            searchResults.innerHTML = res.map(r => `<div style="padding: 10px; border-bottom: 1px solid var(--border-color);">${r}</div>`).join('');
        });
    }

    // Cofre / PIN
    if (userPIN && lockScreen) {
        lockScreen.classList.remove('hidden');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                if (pinInput && pinInput.value === userPIN) {
                    lockScreen.classList.add('hidden');
                } else if (pinError) {
                    pinError.style.display = 'block';
                }
            });
        }
    }

    if (savePinBtn) {
        if (userPIN && pinSettingsInput) pinSettingsInput.value = userPIN;
        savePinBtn.addEventListener('click', () => {
            if (!pinSettingsInput) return;
            const p = pinSettingsInput.value.trim();
            if (p.length === 0) { localStorage.removeItem('userPIN'); alert('Cofre desativado.'); }
            else if (p.length === 4) { localStorage.setItem('userPIN', p); alert('PIN salvo com sucesso!'); }
            else { alert('O PIN precisa ter exatos 4 dígitos.'); }
        });
    }

    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('change', () => {
            localStorage.setItem('gridsEnabled', JSON.stringify(gridToggleBtn.checked));
            if (progressChart) {
                progressChart.destroy();
                progressChart = null;
            }
            updateChart();
        });
    }

    // Renderização e Inicialização
    applyLanguage(currentLanguage);
    applyTheme(currentTheme);
    applyLayout(currentLayout);
    updateXP();
    updateDashboard();
    saveAndRender();
    renderFolders();
    renderNotes();
    renderShortcuts();
    renderHabits();
    setInterval(updateClock, 1000);
    updateClock();
    updateWeather();
});
