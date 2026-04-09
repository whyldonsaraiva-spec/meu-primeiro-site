// Component logic

const Components = {
    // ---- CHART & CHECKLIST LOGIC ----
    chartInstance: null,

    renderTasks() {
        const taskListEl = document.getElementById('taskList');
        if (!taskListEl) return;
        
        taskListEl.innerHTML = "";
        const viewDate = document.getElementById('viewDate')?.value || Utils.getLocalISOString();
        let filtered = AppState.tasks.filter(t => t.date === viewDate);

        const pScore = { 'high': 3, 'medium': 2, 'low': 1 };
        filtered.sort((a, b) => (pScore[b.priority] || 2) - (pScore[a.priority] || 2));

        if (filtered.length === 0) {
            taskListEl.innerHTML = "<p class='text-muted text-center p-20'>Nada para este dia.</p>";
            return;
        }

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.addEventListener('click', () => Components.toggleTask(task.id));

            let pVisual = "";
            if (AppState.emojisEnabled) {
                if (task.priority === 'high') pVisual = '<span class="emoji">🔴</span>';
                if (task.priority === 'low') pVisual = '<span class="emoji">🟢</span>';
                if (task.priority === 'medium' || !task.priority) pVisual = '<span class="emoji">🟡</span>';
            } else {
                let pText = task.priority === 'high' ? '[Alta]' : task.priority === 'low' ? '[Baixa]' : '[Média]';
                pVisual = `<b>${pText}</b>`;
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            
            const spanText = document.createElement('span');
            spanText.innerHTML = `${pVisual} ${Utils.escapeHTML(task.text)}`;

            const delBtn = document.createElement('button');
            delBtn.className = "delete-btn";
            delBtn.innerHTML = AppState.emojisEnabled ? '🗑️' : 'Apagar';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                Components.deleteTask(task.id);
            });

            li.appendChild(checkbox);
            li.appendChild(spanText);
            li.appendChild(delBtn);
            taskListEl.appendChild(li);
        });
    },

    toggleTask(id) {
        AppState.tasks = AppState.tasks.map(task => {
            if (task.id === id) {
                if (!task.completed) {
                    AppState.addXP(10);
                    if(typeof confetti === 'function') {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                } else {
                    AppState.addXP(-10);
                }
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        AppState.sync('tasks');
        Components.renderTasks();
        Components.updateChart();
        document.dispatchEvent(new Event('app:updateDashboard'));
    },

    deleteTask(id) {
        AppState.tasks = AppState.tasks.filter(task => task.id !== id);
        AppState.sync('tasks');
        Components.renderTasks();
        Components.updateChart();
        document.dispatchEvent(new Event('app:updateDashboard'));
    },

    addTask(text, priority) {
        const date = document.getElementById('viewDate')?.value || Utils.getLocalISOString();
        AppState.tasks.push({ id: Date.now(), text, completed: false, date, priority });
        AppState.sync('tasks');
        Components.renderTasks();
        Components.updateChart();
        document.dispatchEvent(new Event('app:updateDashboard'));
    },

    updateChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const period = document.getElementById('reportPeriod')?.value || 'weekly';
        const typeSelect = document.getElementById('chartType')?.value || 'line';
        const now = new Date();
        const days = [];
        let count = 7;

        if (period === 'daily') count = 1;
        else if (period === 'weekly') count = 7;
        else if (period === 'monthly') count = 30;
        else if (period === 'quarterly') count = 90;
        else if (period === 'semiannual') count = 180;
        else if (period === 'annual') count = 365;
        else if (period === 'custom') {
            const start = new Date(document.getElementById('startDate')?.value);
            const end = new Date(document.getElementById('endDate')?.value);
            if (!isNaN(start) && !isNaN(end)) {
                let temp = new Date(start);
                while (temp <= end) {
                    days.push(Utils.getLocalISOString(temp));
                    temp.setDate(temp.getDate() + 1);
                }
            } else {
                days.push(Utils.getLocalISOString());
            }
        }

        if (days.length === 0) {
            for (let i = count - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                days.push(Utils.getLocalISOString(d));
            }
        }

        const dataPoints = days.map(day => {
            const dayTasks = AppState.tasks.filter(t => t.date === day);
            return dayTasks.length === 0 ? 0 : (dayTasks.filter(t => t.completed).length / dayTasks.length) * 100;
        });

        // Summary
        const allTasksPeriod = AppState.tasks.filter(t => days.includes(t.date));
        const totalT = allTasksPeriod.length;
        const completedT = allTasksPeriod.filter(t => t.completed).length;
        const pendingT = totalT - completedT;
        const rate = totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;

        document.getElementById('totalTasks').textContent = totalT;
        document.getElementById('completedTasks').textContent = completedT;
        document.getElementById('pendingTasks').textContent = pendingT;
        document.getElementById('completionRate').textContent = rate + "%";

        const style = getComputedStyle(document.body);
        const accentColor = style.getPropertyValue('--accent-color').trim() || '#4a90e2';
        const textColor = style.getPropertyValue('--text-color').trim() || '#333';
        const borderColor = style.getPropertyValue('--border-color').trim() || '#eee';

        if (Components.chartInstance) {
            Components.chartInstance.destroy();
        }

        let chartData, chartOptions;

        if (typeSelect === 'pie') {
            chartData = {
                labels: ['Feito', 'Pendente'],
                datasets: [{
                    data: [completedT, pendingT],
                    backgroundColor: [accentColor, borderColor + '88'],
                    borderColor: [accentColor, borderColor],
                    borderWidth: 1
                }]
            };
            chartOptions = { responsive: true, maintainAspectRatio: false };
        } else {
            chartData = {
                labels: days.map(d => d.split('-').reverse().slice(0, 2).join('/')),
                datasets: [{
                    label: '% Concluído',
                    data: dataPoints,
                    borderColor: accentColor,
                    backgroundColor: accentColor + '33',
                    tension: 0.4,
                    fill: typeSelect === 'line'
                }]
            };
            chartOptions = {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { color: textColor }, grid: { display: AppState.gridsEnabled } },
                    x: { ticks: { color: textColor }, grid: { display: AppState.gridsEnabled } }
                }
            };
        }

        Components.chartInstance = new Chart(ctx.getContext('2d'), {
            type: typeSelect === 'pie' ? 'pie' : typeSelect === 'bar' ? 'bar' : 'line',
            data: chartData,
            options: chartOptions
        });
    },

    // ---- HABITS LOGIC ----
    renderHabits() {
        const habitListUI = document.getElementById('habitList');
        if (!habitListUI) return;
        
        habitListUI.innerHTML = "";
        if (AppState.habits.length === 0) {
            habitListUI.innerHTML = "<p class='text-muted text-center'>Nenhum hábito cadastrado ainda.</p>";
            return;
        }

        const todayObj = new Date();
        const last15Days = [];
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(todayObj.getDate() - i);
            last15Days.push(Utils.getLocalISOString(d));
        }

        AppState.habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = "card glass p-15 mb-15";

            let streak = 0;
            let tempD = new Date();
            while (habit.history && habit.history[Utils.getLocalISOString(tempD)]) {
                streak++;
                tempD.setDate(tempD.getDate() - 1);
            }

            const header = document.createElement('div');
            header.className = "flex-between mb-10";
            header.innerHTML = `<h4 class="m-0">${Utils.escapeHTML(habit.text)} <span class="text-accent text-sm">🔥 ${streak} dias</span></h4>`;
            
            const delBtn = document.createElement('button');
            delBtn.className = "delete-btn text-sm";
            delBtn.innerHTML = AppState.emojisEnabled ? '🗑️' : 'X';
            delBtn.onclick = async () => {
                const conf = await Utils.CustomModal.confirm("Excluir este hábito?");
                if(conf) {
                    AppState.habits = AppState.habits.filter(h => h.id !== habit.id);
                    AppState.sync('habits');
                    Components.renderHabits();
                    document.dispatchEvent(new Event('app:updateDashboard'));
                }
            };
            header.appendChild(delBtn);
            habitCard.appendChild(header);

            const grid = document.createElement('div');
            grid.className = "habit-grid";
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(15, 1fr)";
            grid.style.gap = "4px";

            last15Days.forEach(date => {
                const done = habit.history && habit.history[date];
                const daySlot = document.createElement('div');
                daySlot.title = date.split('-').reverse().join('/');
                daySlot.className = "habit-box cursor-pointer";
                daySlot.style.aspectRatio = "1";
                daySlot.style.borderRadius = "4px";
                daySlot.style.background = done ? "var(--accent-color)" : "var(--bg-color)";
                daySlot.style.border = "1px solid var(--border-color)";
                
                daySlot.onclick = () => {
                    if (!habit.history) habit.history = {};
                    if (habit.history[date]) {
                        delete habit.history[date];
                        AppState.addXP(-15);
                    } else {
                        habit.history[date] = true;
                        AppState.addXP(15);
                    }
                    AppState.sync('habits');
                    Components.renderHabits();
                    document.dispatchEvent(new Event('app:updateDashboard'));
                };
                grid.appendChild(daySlot);
            });

            habitCard.appendChild(grid);
            habitListUI.appendChild(habitCard);
        });
    },

    // ---- NOTES LOGIC ----
    renderFolders() {
        const fList = document.getElementById('folderList');
        const mSelect = document.getElementById('moveFolderSelect');
        if (!fList) return;

        fList.innerHTML = "";
        if(mSelect) mSelect.innerHTML = "";

        AppState.folders.forEach(folder => {
            const li = document.createElement('li');
            li.className = `folder-item flex-between align-center ${folder.id === AppState.currentFolderId ? 'active' : ''}`;
            
            const span = document.createElement('span');
            span.textContent = (AppState.emojisEnabled ? "📁 " : "") + folder.name;
            span.className = "flex-1";
            span.onclick = () => {
                AppState.currentFolderId = folder.id;
                AppState.currentNoteId = null;
                Components.renderFolders();
                Components.renderNotes();
                Components.toggleEditor(false);
            };

            li.appendChild(span);

            if (folder.id !== 1) {
                const del = document.createElement('button');
                del.className = "delete-folder-btn";
                del.textContent = AppState.emojisEnabled ? "🗑️" : "X";
                del.onclick = async (e) => {
                    e.stopPropagation();
                    const conf = await Utils.CustomModal.confirm("Excluir esta pasta apagará as notas. Confirmar?");
                    if(conf) {
                        AppState.folders = AppState.folders.filter(f => f.id !== folder.id);
                        AppState.notes = AppState.notes.filter(n => n.folderId !== folder.id);
                        if (AppState.currentFolderId === folder.id) {
                            AppState.currentFolderId = 1;
                            AppState.currentNoteId = null;
                            Components.toggleEditor(false);
                        }
                        AppState.sync('folders');
                        AppState.sync('notes');
                        Components.renderFolders();
                        Components.renderNotes();
                    }
                };
                li.appendChild(del);
            }
            fList.appendChild(li);

            if(mSelect) {
                const opt = document.createElement('option');
                opt.value = folder.id;
                opt.textContent = folder.name;
                mSelect.appendChild(opt);
            }
        });
    },

    renderNotes() {
        const nList = document.getElementById('notesList');
        if (!nList) return;
        nList.innerHTML = "";
        
        const filtered = AppState.notes.filter(n => n.folderId === AppState.currentFolderId);
        filtered.forEach(note => {
            const li = document.createElement('li');
            li.className = `note-item ${note.id === AppState.currentNoteId ? 'active' : ''}`;
            li.textContent = (AppState.emojisEnabled ? "📄 " : "") + (note.title || "Sem título");
            li.onclick = () => Components.openNote(note.id);
            nList.appendChild(li);
        });
    },

    openNote(id) {
        AppState.currentNoteId = id;
        const note = AppState.notes.find(n => n.id === id);
        if (note) {
            document.getElementById('noteTitle').value = note.title;
            // Using innerHTML is risky here but required for rich-text note continuity. Should apply a basic sanitizer if we pull remote.
            // Since it's localStorage, we will inject it.
            document.getElementById('noteText').innerHTML = note.content;
            const mSelect = document.getElementById('moveFolderSelect');
            if (mSelect) mSelect.value = note.folderId;
            Components.toggleEditor(true);
            Components.renderNotes();
        }
    },

    toggleEditor(visible) {
        document.getElementById('editorContent')?.classList.toggle('hidden', !visible);
        document.getElementById('editorEmptyState')?.classList.toggle('hidden', visible);
    },

    // ---- SHORTCUTS LOGIC ----
    renderShortcuts() {
        const scList = document.getElementById('shortcutList');
        if(!scList) return;
        scList.innerHTML = "";

        AppState.shortcuts.forEach(s => {
            const li = document.createElement('li');
            li.className = "shortcut-item";
            
            const link = document.createElement('a');
            link.href = s.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${s.url}" alt="" class="w-16 h-16 me-10">${Utils.escapeHTML(s.name)}`;
            
            const delBtn = document.createElement('button');
            delBtn.className = "delete-btn";
            delBtn.innerHTML = AppState.emojisEnabled ? '🗑️' : 'Apagar';
            delBtn.onclick = () => {
                AppState.shortcuts = AppState.shortcuts.filter(x => x.id !== s.id);
                AppState.sync('shortcuts');
                Components.renderShortcuts();
            };

            li.appendChild(link);
            li.appendChild(delBtn);
            scList.appendChild(li);
        });
    }
};
