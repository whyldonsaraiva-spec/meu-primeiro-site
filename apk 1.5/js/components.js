// --- COMPONENTES E LÓGICA DE VISUALIZAÇÃO/RENDERIZAÇÃO (components.js) ---

// Navegação por Abas
function openTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Encontra o botão correspondente se chamado programmaticamente
        const btn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
        if (btn) btn.classList.add('active');
    }

    if ((tabId === 'checklistTab' || tabId === 'progressTab') && typeof updateChart === 'function') {
        updateChart();
    }
    if (tabId === 'habitsTab') {
        renderHabits();
    }
}

function showSplashScreen() {
    if (splashScreen) {
        splashScreen.classList.remove('splash-hidden');
        localStorage.removeItem('appStarted');
    }
}

function applyTheme(theme) {
    if (themeSelect) themeSelect.value = theme;
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'white');
    } else {
        document.body.setAttribute('data-theme', theme);
    }
    if (progressChart) updateChart();
}

function applyLayout(layout) {
    document.body.setAttribute('data-layout', layout);
    if (layoutSelect) layoutSelect.value = layout;
    localStorage.setItem('layout', layout);
}

// Lógica de Checklist / Tarefas
function addTask() {
    if (!taskInput) return;
    const text = taskInput.value.trim();
    const date = viewDateInput ? viewDateInput.value : new Date().toISOString().split('T')[0];
    const priority = taskPriority ? taskPriority.value : 'medium';
    if (text !== "") {
        tasks.push({ id: Date.now(), text, completed: false, date, priority });
        taskInput.value = "";
        saveAndRender();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            if (!task.completed) {
                playSound();
                if (gamificationEnabled) addXP(10);
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#4a90e2', '#2ecc71', '#f1c40f']
                    });
                }
            } else {
                if (gamificationEnabled) addXP(-10);
            }
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateChart();
    if (typeof updateDashboard === 'function') updateDashboard();
}

function renderTasks() {
    if (!taskList || !viewDateInput) return;
    taskList.innerHTML = "";
    let filtered = tasks.filter(t => t.date === viewDateInput.value);

    const pScore = { 'high': 3, 'medium': 2, 'low': 1 };
    filtered.sort((a, b) => {
        let sa = pScore[a.priority] || 2;
        let sb = pScore[b.priority] || 2;
        return sb - sa;
    });

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.onclick = () => toggleTask(task.id);

        let pSym = '';
        let pText = '';
        if (task.priority === 'high') { pSym = '🔴'; pText = '[Alta]'; }
        if (task.priority === 'low') { pSym = '🟢'; pText = '[Baixa]'; }
        if (task.priority === 'medium' || !task.priority) { pSym = '🟡'; pText = '[Média]'; }

        let pVisual = emojisEnabled ? `<span class="emoji">${pSym}</span>` : `<b>${pText}</b>`;

        li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span>${pVisual} ${task.text}</span>
      <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">${emojisEnabled ? '🗑️' : 'Apagar'}</button>
    `;
        taskList.appendChild(li);
    });
    if (filtered.length === 0) taskList.innerHTML = "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Nada para este dia.</p>";
}

function navigateDate(offsetDays) {
    if (!viewDateInput) return;
    const currentVal = viewDateInput.value;
    const dt = currentVal ? new Date(currentVal + 'T00:00:00') : new Date();
    dt.setDate(dt.getDate() + offsetDays);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    viewDateInput.value = `${yyyy}-${mm}-${dd}`;
    renderTasks();
    if (typeof updateChart === 'function') updateChart();
}

// Lógica de Relatórios / Gráficos
function getDaysInRange() {
    if (!reportPeriodSelect) return [viewDateInput ? viewDateInput.value : new Date().toISOString().split('T')[0]];
    const period = reportPeriodSelect.value;
    const days = [];
    const now = new Date();
    let count = 7;

    if (period === 'daily') count = 1;
    else if (period === 'weekly') count = 7;
    else if (period === 'monthly') count = 30;
    else if (period === 'quarterly') count = 90;
    else if (period === 'semiannual') count = 180;
    else if (period === 'annual') count = 365;
    else if (period === 'custom') {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        if (isNaN(start) || isNaN(end)) return [viewDateInput.value];
        let temp = new Date(start);
        while (temp <= end) {
            days.push(temp.toISOString().split('T')[0]);
            temp.setDate(temp.getDate() + 1);
        }
        return days;
    }

    for (let i = count - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

function updateChart() {
    const chartCanvas = document.getElementById('progressChart');
    if (!chartCanvas) return;
    
    const days = getDaysInRange();
    const type = chartTypeSelect ? chartTypeSelect.value : 'line';
    
    let chartType = type;
    let indexAxis = 'x';
    let fill = false;
    let categoryPercentage = 0.8;
    let barPercentage = 0.9;

    if (type === 'area') {
        chartType = 'line';
        fill = true;
    } else if (type === 'horizontalBar') {
        chartType = 'bar';
        indexAxis = 'y';
    } else if (type === 'histogram') {
        chartType = 'bar';
        categoryPercentage = 1.0;
        barPercentage = 1.0;
    }

    const dataPoints = days.map(day => {
        const dayTasks = tasks.filter(t => t.date === day);
        return dayTasks.length === 0 ? 0 : (dayTasks.filter(t => t.completed).length / dayTasks.length) * 100;
    });

    const style = getComputedStyle(document.body);
    const accentColor = style.getPropertyValue('--accent-color').trim() || '#4a90e2';
    const textColor = style.getPropertyValue('--text-color').trim() || '#333';
    const borderColor = style.getPropertyValue('--border-color').trim() || '#eee';

    const allTasksPeriod = tasks.filter(t => days.includes(t.date));
    const totalT = allTasksPeriod.length;
    const completedT = allTasksPeriod.filter(t => t.completed).length;
    const pendingT = totalT - completedT;
    const rate = totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;

    if (totalTasksSpan) totalTasksSpan.textContent = totalT;
    if (completedTasksSpan) completedTasksSpan.textContent = completedT;
    const pendingTasksSpan = document.getElementById('pendingTasks');
    if (pendingTasksSpan) pendingTasksSpan.textContent = pendingT;
    const completionRateSpan = document.getElementById('completionRate');
    if (completionRateSpan) completionRateSpan.textContent = rate + "%";

    const showGrids = gridToggleBtn ? gridToggleBtn.checked : true;

    let chartData;
    let chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: type === 'pie' }
        }
    };

    if (type === 'pie') {
        chartData = {
            labels: ['Feito', 'Pendente'],
            datasets: [{
                data: [completedT, pendingT],
                backgroundColor: [accentColor, borderColor + '88'],
                borderColor: [accentColor, borderColor],
                borderWidth: 1
            }]
        };
    } else {
        chartData = {
            labels: days.map(d => d.split('-').reverse().slice(0, 2).join('/')),
            datasets: [{
                label: '% Concluído',
                data: dataPoints,
                borderColor: accentColor,
                backgroundColor: accentColor + '33',
                fill: fill,
                tension: 0.4,
                categoryPercentage: categoryPercentage,
                barPercentage: barPercentage
            }]
        };
        chartOptions.indexAxis = indexAxis;
        chartOptions.scales = {
            y: { min: 0, max: 100, ticks: { color: textColor }, grid: { display: showGrids } },
            x: { ticks: { color: textColor }, grid: { display: showGrids } }
        };
        if (indexAxis === 'y') {
            chartOptions.scales.x = { min: 0, max: 100, ticks: { color: textColor }, grid: { display: showGrids } };
            chartOptions.scales.y = { ticks: { color: textColor }, grid: { display: showGrids } };
        }
    }

    if (typeof Chart === 'undefined') return;

    if (!progressChart) {
        const ctx = chartCanvas.getContext('2d');
        progressChart = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    } else {
        progressChart.data = chartData;
        progressChart.options = chartOptions;
        progressChart.update();
    }
}

// Lógica de Bloco de Notas
function createNewFolder() {
    const name = prompt("Nome da nova pasta:");
    if (name) {
        const newFolder = { id: Date.now(), name };
        folders.push(newFolder);
        localStorage.setItem('folders', JSON.stringify(folders));
        renderFolders();
    }
}

function renderFolders() {
    if (!folderListUI) return;
    folderListUI.innerHTML = "";
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.className = `folder-item ${folder.id === currentFolderId ? 'active' : ''}`;

        const span = document.createElement('span');
        span.textContent = (emojisEnabled ? "📁 " : "") + folder.name;
        span.style.flex = "1";
        span.onclick = () => {
            currentFolderId = folder.id;
            currentNoteId = null;
            renderFolders();
            renderNotes();
            showEditor(false);
        };

        const delBtn = document.createElement('button');
        delBtn.className = "delete-folder-btn";
        delBtn.textContent = emojisEnabled ? "🗑️" : "X";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteFolder(folder.id);
        };

        li.style.display = "flex";
        li.style.alignItems = "center";
        li.appendChild(span);
        if (folder.id !== 1) {
            li.appendChild(delBtn);
        }

        folderListUI.appendChild(li);
    });

    if (moveFolderSelect) {
        moveFolderSelect.innerHTML = folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    }
}

function deleteFolder(id) {
    if (confirm("Excluir esta pasta também apagará todas as notas nela. Confirmar?")) {
        folders = folders.filter(f => f.id !== id);
        notes = notes.filter(n => n.folderId !== id);
        if (currentFolderId === id) {
            currentFolderId = folders[0] ? folders[0].id : 1;
            currentNoteId = null;
            showEditor(false);
        }
        localStorage.setItem('folders', JSON.stringify(folders));
        saveNotes();
        renderFolders();
        renderNotes();
    }
}

function createNewNote() {
    const note = {
        id: Date.now(),
        folderId: currentFolderId,
        title: "Nova Nota",
        content: ""
    };
    notes.push(note);
    currentNoteId = note.id;
    saveNotes();
    renderNotes();
    openNote(note.id);
}

function renderNotes() {
    if (!notesListUI) return;
    notesListUI.innerHTML = "";
    const filtered = notes.filter(n => n.folderId === currentFolderId);
    filtered.forEach(note => {
        const li = document.createElement('li');
        li.className = `note-item ${note.id === currentNoteId ? 'active' : ''}`;
        li.textContent = (emojisEnabled ? "📄 " : "") + (note.title || "Sem título");
        li.onclick = () => openNote(note.id);
        notesListUI.appendChild(li);
    });
}

function openNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (note && noteTitleInput && noteTextInput) {
        noteTitleInput.value = note.title;
        noteTextInput.innerHTML = note.content;
        if (moveFolderSelect) moveFolderSelect.value = note.folderId;
        showEditor(true);
        renderNotes();
    }
}

function showEditor(visible) {
    if (!editorContent || !editorEmptyState) return;
    if (visible) {
        editorContent.classList.remove('hidden');
        editorEmptyState.classList.add('hidden');
    } else {
        editorContent.classList.add('hidden');
        editorEmptyState.classList.remove('hidden');
    }
}

function saveCurrentNote() {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.title = noteTitleInput ? noteTitleInput.value : note.title;
        note.content = noteTextInput ? noteTextInput.innerHTML : note.content;
        if (moveFolderSelect) note.folderId = parseInt(moveFolderSelect.value);

        saveNotes();
        renderNotes();
        alert("Nota salva com sucesso!");

        if (note.folderId !== currentFolderId) {
            showEditor(false);
            renderNotes();
        }
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function deleteCurrentNote() {
    if (confirm("Deseja realmente excluir esta nota?")) {
        notes = notes.filter(n => n.id !== currentNoteId);
        currentNoteId = null;
        saveNotes();
        renderNotes();
        showEditor(false);
    }
}

// Lógica de Atalhos
function addShortcut() {
    if (!shortcutNameInput || !shortcutUrlInput) return;
    const name = shortcutNameInput.value.trim();
    let url = shortcutUrlInput.value.trim();

    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        shortcuts.push({ id: Date.now(), name, url });
        shortcutNameInput.value = "";
        shortcutUrlInput.value = "";
        saveShortcuts();
        renderShortcuts();
    }
}

function deleteShortcut(id) {
    shortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts();
    renderShortcuts();
}

function saveShortcuts() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

function renderShortcuts() {
    if (!shortcutListUI) return;
    shortcutListUI.innerHTML = "";
    shortcuts.forEach(s => {
        const li = document.createElement('li');
        li.className = "shortcut-item";
        li.innerHTML = `
            <a href="${s.url}" target="_blank" rel="noopener noreferrer">
                <img src="https://www.google.com/s2/favicons?domain=${s.url}" alt="" style="width: 16px; height: 16px;">
                ${s.name}
            </a>
            <button class="delete-btn" onclick="deleteShortcut(${s.id})">${emojisEnabled ? '🗑️' : 'Apagar'}</button>
        `;
        shortcutListUI.appendChild(li);
    });
}

// Lógica de Hábitos
function addHabit() {
    if (!habitInput) return;
    const text = habitInput.value.trim();
    if (text) {
        habits.push({
            id: Date.now(),
            text: text,
            history: {}
        });
        habitInput.value = "";
        saveHabits();
        renderHabits();
        updateDashboard();
    }
}

function toggleHabitDay(habitId, date) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        if (habit.history[date]) {
            delete habit.history[date];
            if (gamificationEnabled) addXP(-15);
        } else {
            habit.history[date] = true;
            if (gamificationEnabled) addXP(15);
        }
        saveHabits();
        renderHabits();
        updateDashboard();
    }
}

function deleteHabit(id) {
    if (confirm("Excluir este hábito permanentemente?")) {
        habits = habits.filter(h => h.id !== id);
        saveHabits();
        renderHabits();
        updateDashboard();
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits() {
    if (!habitListUI) return;
    habitListUI.innerHTML = "";

    if (habits.length === 0) {
        habitListUI.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhum hábito cadastrado ainda.</p>";
        return;
    }

    const todayObj = new Date();
    const last15Days = [];
    for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(todayObj.getDate() - i);
        last15Days.push(d.toISOString().split('T')[0]);
    }

    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = "card glass";
        habitCard.style.padding = "15px";

        let streak = 0;
        let tempD = new Date();
        while (habit.history && habit.history[tempD.toISOString().split('T')[0]]) {
            streak++;
            tempD.setDate(tempD.getDate() - 1);
        }

        habitCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin:0;">${habit.text} <span style="font-size:0.8rem; color:var(--accent-color);">🔥 ${streak} dias</span></h4>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})" style="font-size:0.9rem;">${emojisEnabled ? '🗑️' : 'X'}</button>
            </div>
            <div class="habit-grid" style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 4px;">
                ${last15Days.map(date => {
            const done = habit.history && habit.history[date];
            return `<div 
                        onclick="toggleHabitDay(${habit.id}, '${date}')" 
                        title="${date.split('-').reverse().join('/')}"
                        style="aspect-ratio: 1; border-radius: 4px; background: ${done ? 'var(--accent-color)' : 'var(--bg-color)'}; cursor: pointer; border: 1px solid var(--border-color); width: 100%;">
                    </div>`;
        }).join('')}
            </div>
        `;
        habitListUI.appendChild(habitCard);
    });
}

// --- LÓGICA DO MODAL DE OPÇÕES DE TAREFAS (IMPORTAR / EXPORTAR) ---

function openTaskOptionsModal() {
    if (!taskOptionsModal) return;
    const currentViewDate = viewDateInput ? viewDateInput.value : new Date().toISOString().split('T')[0];
    const formattedCurrentDate = currentViewDate.split('-').reverse().join('/');
    
    if (importTargetDateDisplay) importTargetDateDisplay.textContent = formattedCurrentDate;
    if (exportSourceDateDisplay) exportSourceDateDisplay.textContent = formattedCurrentDate;
    
    if (importSourceDateInput) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        importSourceDateInput.value = yesterday.toISOString().split('T')[0];
        importSourceDateInput.onchange = loadImportSourceDateTasks;
    }
    
    exportTargetDatesList = [];
    renderExportTargetDates();
    
    switchOptionsTab('import');
    loadImportSourceDateTasks();
    loadExportSourceTasks();
    
    taskOptionsModal.classList.remove('hidden');
}

function closeTaskOptionsModal() {
    if (taskOptionsModal) taskOptionsModal.classList.add('hidden');
}

function switchOptionsTab(tabName) {
    if (tabName === 'import') {
        if (tabImportBtn) tabImportBtn.classList.add('active');
        if (tabExportBtn) tabExportBtn.classList.remove('active');
        if (optionsImportContent) optionsImportContent.classList.remove('hidden');
        if (optionsExportContent) optionsExportContent.classList.add('hidden');
    } else {
        if (tabExportBtn) tabExportBtn.classList.add('active');
        if (tabImportBtn) tabImportBtn.classList.remove('active');
        if (optionsExportContent) optionsExportContent.classList.remove('hidden');
        if (optionsImportContent) optionsImportContent.classList.add('hidden');
    }
}

// FUNCIONALIDADE 1: IMPORTAR DE OUTRA DATA
function loadImportSourceDateTasks() {
    if (!importTaskList || !importSourceDateInput) return;
    const srcDate = importSourceDateInput.value;
    const srcTasks = tasks.filter(t => t.date === srcDate);
    
    if (srcTasks.length === 0) {
        importTaskList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 15px;">Nenhuma tarefa encontrada na data ${srcDate.split('-').reverse().join('/')}.</p>`;
        return;
    }
    
    importTaskList.innerHTML = srcTasks.map(t => `
        <label style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); cursor: pointer;">
            <input type="checkbox" class="import-task-checkbox" value="${t.id}" checked style="margin-right: 10px; width: 18px; height: 18px; accent-color: var(--primary-color);">
            <span>${emojisEnabled ? (t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡') : ''} ${t.text}</span>
        </label>
    `).join('');
}

function toggleSelectAllImportTasks() {
    const checkboxes = document.querySelectorAll('.import-task-checkbox');
    if (checkboxes.length === 0) return;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

function confirmImportTasks() {
    const checkboxes = document.querySelectorAll('.import-task-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos uma tarefa para importar.");
        return;
    }
    
    const targetDate = viewDateInput ? viewDateInput.value : new Date().toISOString().split('T')[0];
    let count = 0;
    
    checkboxes.forEach(cb => {
        const taskId = parseInt(cb.value);
        const originalTask = tasks.find(t => t.id === taskId);
        if (originalTask) {
            tasks.push({
                id: Date.now() + count,
                text: originalTask.text,
                completed: false,
                date: targetDate,
                priority: originalTask.priority || 'medium'
            });
            count++;
        }
    });
    
    saveAndRender();
    closeTaskOptionsModal();
    alert(`${count} tarefa(s) importada(s) com sucesso para ${targetDate.split('-').reverse().join('/')}!`);
}

// FUNCIONALIDADE 2: EXPORTAR PARA OUTRA DATA
function loadExportSourceTasks() {
    if (!exportTaskList || !viewDateInput) return;
    const currentViewDate = viewDateInput.value;
    const srcTasks = tasks.filter(t => t.date === currentViewDate);
    
    if (srcTasks.length === 0) {
        exportTaskList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 15px;">Nenhuma tarefa encontrada no dia de hoje para exportar.</p>`;
        return;
    }
    
    exportTaskList.innerHTML = srcTasks.map(t => `
        <label style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); cursor: pointer;">
            <input type="checkbox" class="export-task-checkbox" value="${t.id}" checked style="margin-right: 10px; width: 18px; height: 18px; accent-color: var(--primary-color);">
            <span>${emojisEnabled ? (t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡') : ''} ${t.text}</span>
        </label>
    `).join('');
}

function toggleSelectAllExportTasks() {
    const checkboxes = document.querySelectorAll('.export-task-checkbox');
    if (checkboxes.length === 0) return;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

function addExportDateRange() {
    if (!exportStartDateInput || !exportEndDateInput) return;
    const startVal = exportStartDateInput.value;
    const endVal = exportEndDateInput.value;
    
    if (!startVal || !endVal) {
        alert(currentLanguage === 'en' ? "Please select both start and end dates." : "Por favor, selecione a Data Inicial e a Data Final.");
        return;
    }
    
    const start = new Date(startVal + 'T00:00:00');
    const end = new Date(endVal + 'T00:00:00');
    
    if (start > end) {
        alert(currentLanguage === 'en' ? "Start date cannot be after end date." : "A Data Inicial não pode ser posterior à Data Final.");
        return;
    }
    
    let temp = new Date(start);
    let addedCount = 0;
    while (temp <= end) {
        const yyyy = temp.getFullYear();
        const mm = String(temp.getMonth() + 1).padStart(2, '0');
        const dd = String(temp.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        if (!exportTargetDatesList.includes(dateStr)) {
            exportTargetDatesList.push(dateStr);
            addedCount++;
        }
        temp.setDate(temp.getDate() + 1);
    }
    
    renderExportTargetDates();
}

function removeExportTargetDate(dateStr) {
    exportTargetDatesList = exportTargetDatesList.filter(d => d !== dateStr);
    renderExportTargetDates();
}

function renderExportTargetDates() {
    if (!exportTargetDatesContainer) return;
    if (exportTargetDatesList.length === 0) {
        const msg = currentLanguage === 'en' ? "No target dates selected yet." : "Nenhuma data de destino selecionada ainda.";
        exportTargetDatesContainer.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">${msg}</span>`;
        return;
    }
    
    exportTargetDatesContainer.innerHTML = exportTargetDatesList.map(d => `
        <span style="background: var(--primary-color); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
            ${d.split('-').reverse().join('/')}
            <button onclick="removeExportTargetDate('${d}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold; font-size: 0.9rem;">✕</button>
        </span>
    `).join('');
}

function confirmExportTasks() {
    const checkboxes = document.querySelectorAll('.export-task-checkbox:checked');
    if (checkboxes.length === 0) {
        alert(currentLanguage === 'en' ? "Select at least one task to export." : "Selecione pelo menos uma tarefa para exportar.");
        return;
    }
    
    if (exportTargetDatesList.length === 0) {
        alert(currentLanguage === 'en' ? "Add at least one target date range." : "Adicione pelo menos um intervalo de datas de destino.");
        return;
    }
    
    let totalCopied = 0;
    
    exportTargetDatesList.forEach(targetDate => {
        checkboxes.forEach(cb => {
            const taskId = parseInt(cb.value);
            const originalTask = tasks.find(t => t.id === taskId);
            if (originalTask) {
                tasks.push({
                    id: Date.now() + totalCopied,
                    text: originalTask.text,
                    completed: false,
                    date: targetDate,
                    priority: originalTask.priority || 'medium'
                });
                totalCopied++;
            }
        });
    });
    
    saveAndRender();
    closeTaskOptionsModal();
    const successMsg = currentLanguage === 'en' 
        ? `Success! ${checkboxes.length} task(s) exported to ${exportTargetDatesList.length} date(s)!` 
        : `Sucesso! ${checkboxes.length} tarefa(s) exportada(s) para ${exportTargetDatesList.length} data(s)!`;
    alert(successMsg);
}

// --- SUPORTE A IDIOMAS (i18n) ---
function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    if (langSelect) langSelect.value = lang;

    const t = i18n[lang] || i18n.pt;

    if (tabImportBtn) tabImportBtn.textContent = t.tabImportTitle;
    if (tabExportBtn) tabExportBtn.textContent = t.tabExportTitle;

    if (taskInput) taskInput.placeholder = t.taskInputPlaceholder;
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // Atualiza botões e rótulos
    if (addTaskBtn) addTaskBtn.textContent = t.addBtn;
    
    renderTasks();
    updateDashboard();
}

// Lógica de Dashboard
function updateDashboardSummary() {
    if (!yesterdaySummary) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    const yTasks = tasks.filter(t => t.date === yKey);
    const done = yTasks.filter(t => t.completed).length;
    if (yTasks.length === 0) {
        yesterdaySummary.textContent = "Nenhuma tarefa registrada ontem. Vamos fazer um dia incrível hoje?";
    } else {
        const perc = Math.round((done / yTasks.length) * 100);
        yesterdaySummary.textContent = `Ontem você completou ${done}/${yTasks.length} tarefas (${perc}%). ${perc >= 80 ? 'Continue com esse ritmo!' : 'Hoje é um novo dia para brilhar.'}`;
    }
}

function updateDashboard() {
    if (welcomeText) {
        const hour = new Date().getHours();
        let greeting = "Boa noite!";
        let emoji = "🌙";
        if (hour >= 5 && hour < 12) { greeting = "Bom dia!"; emoji = "☀️"; }
        else if (hour >= 12 && hour < 18) { greeting = "Boa tarde!"; emoji = "☕"; }

        const emojiSpan = emojisEnabled ? `<span class="emoji">${emoji}</span>` : "";
        welcomeText.innerHTML = `${greeting} ${emojiSpan} Pronto para evoluir?`;
    }

    const dailyQuoteEl = document.getElementById('dailyQuote');
    if (dailyQuoteEl) dailyQuoteEl.textContent = customQuote;

    if (highPriorityList) {
        highPriorityList.innerHTML = "";
        const todayStr = new Date().toISOString().split('T')[0];

        const highToday = tasks.filter(t => t.date === todayStr && t.priority === 'high' && !t.completed);
        const pendingHabits = habits.filter(h => !h.history || !h.history[todayStr]);

        let items = [];

        highToday.forEach(t => {
            const sym = emojisEnabled ? '🔴' : '<b>[Alta]</b>';
            items.push(`<li class="task-item" style="margin: 0; border-left: 4px solid #e74c3c; padding: 10px; background: var(--bg-color);" onclick="openTab(null, 'checklistTab'); if (viewDateInput) viewDateInput.value = '${t.date}'; renderTasks();">
                ${sym} <span style="font-size:0.9rem;">Tarefa: ${t.text}</span>
            </li>`);
        });

        pendingHabits.forEach(h => {
            const sym = emojisEnabled ? '🧬' : '<b>[Hábito]</b>';
            items.push(`<li class="task-item" style="margin: 0; border-left: 4px solid var(--accent-color); padding: 10px; background: var(--bg-color);" onclick="openTab(null, 'habitsTab');">
                ${sym} <span style="font-size:0.9rem;">Hábito: ${h.text}</span>
            </li>`);
        });

        if (items.length > 0) {
            highPriorityList.innerHTML = items.join('');
        } else {
            const emojiFesta = emojisEnabled ? '🎉' : '';
            highPriorityList.innerHTML = `<p style='color:var(--text-muted); font-size:0.9rem; text-align:center; width:100%;'>Nenhuma pendente! ${emojiFesta}</p>`;
        }
    }

    updateDashboardSummary();
}
