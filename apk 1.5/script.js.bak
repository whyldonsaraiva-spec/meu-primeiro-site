// --- CONFIGURAÇÃO INICIAL ---

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const themeSelect = document.getElementById('themeSelect');
const layoutSelect = document.getElementById('layoutSelect');
const viewDateInput = document.getElementById('viewDate');
const reportPeriodSelect = document.getElementById('reportPeriod');
const chartTypeSelect = document.getElementById('chartType');
const customRangeDiv = document.getElementById('customRange');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

// Elementos da Splash Screen
const splashScreen = document.getElementById('splashScreen');
const startAppBtn = document.getElementById('startAppBtn');

// Elementos de Configurações
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const resetAllBtn = document.getElementById('resetAllBtn');

// Elementos de Atalhos
const shortcutNameInput = document.getElementById('shortcutNameInput');
const shortcutUrlInput = document.getElementById('shortcutUrlInput');
const addShortcutBtn = document.getElementById('addShortcutBtn');
const shortcutListUI = document.getElementById('shortcutList');

// Elementos do Bloco de Notas
const folderListUI = document.getElementById('folderList');
const notesListUI = document.getElementById('notesList');
const editorContent = document.getElementById('editorContent');
const editorEmptyState = document.getElementById('editorEmptyState');
const noteTitleInput = document.getElementById('noteTitle');
const noteTextInput = document.getElementById('noteText');

// Configura a data inicial como sendo "Hoje"
const today = new Date().toISOString().split('T')[0];
viewDateInput.value = today;

const scriptContainer = document.getElementById('taskList'); // Dummy line to keep indices
const taskPriority = document.getElementById('taskPriority');

// Elementos Foco
const pomoMinutesUI = document.getElementById('pomoMinutes');
const pomoSecondsUI = document.getElementById('pomoSeconds');
const pomoStatusUI = document.getElementById('pomoStatus');
const startPomoBtn = document.getElementById('startPomoBtn');
const pausePomoBtn = document.getElementById('pausePomoBtn');
const resetPomoBtn = document.getElementById('resetPomoBtn');

// Hábitos removido

// Elementos Settings e Dashboard
const customQuoteInput = document.getElementById('customQuoteInput');
const emojiToggleBtn = document.getElementById('emojiToggleBtn');
const gamificationToggleBtn = document.getElementById('gamificationToggleBtn');
const gridToggleBtn = document.getElementById('gridToggleBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataInput = document.getElementById('importDataInput');
const moveFolderSelect = document.getElementById('moveFolderSelect');
const xpBadge = document.getElementById('xpBadge');
const welcomeText = document.getElementById('welcomeText');
const highPriorityList = document.getElementById('highPriorityList');

// Cofre & Busca & Ambient
const lockScreen = document.getElementById('lockScreen');
const pinInput = document.getElementById('pinInput');
const unlockBtn = document.getElementById('unlockBtn');
const pinError = document.getElementById('pinError');
const pinSettingsInput = document.getElementById('pinSettingsInput');
const savePinBtn = document.getElementById('savePinBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const openSearchBtn = document.getElementById('openSearchBtn');
const recordAudioBtn = document.getElementById('recordAudioBtn');
const habitInput = document.getElementById('habitInput');
const habitListUI = document.getElementById('habitList');
const digitalClock = document.getElementById('digitalClock');
const weatherWidget = document.getElementById('weatherWidget');
const yesterdaySummary = document.getElementById('yesterdaySummary');

// Dados principais
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let folders = JSON.parse(localStorage.getItem('folders')) || [{ id: 1, name: 'Geral' }];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentTheme = localStorage.getItem('theme') || 'system';
let currentLayout = localStorage.getItem('layout') || 'default';
let customQuote = localStorage.getItem('customQuote') || '"Ação é a chave fundamental para todo sucesso."';
let emojisEnabled = JSON.parse(localStorage.getItem('emojisEnabled'));
if (emojisEnabled === null) emojisEnabled = true;

let gamificationEnabled = JSON.parse(localStorage.getItem('gamificationEnabled'));
if (gamificationEnabled === null) gamificationEnabled = true;

let gridsEnabled = JSON.parse(localStorage.getItem('gridsEnabled'));
if (gridsEnabled === null) gridsEnabled = true;

if (gridToggleBtn) gridToggleBtn.checked = gridsEnabled;

let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userPIN = localStorage.getItem('userPIN');

// Estados de seleção
let currentFolderId = folders[0].id;
let currentNoteId = null;

// Foco State
let pomoInterval = null;
let pomoTimeTotal = 25 * 60;
let pomoTimeLeft = pomoTimeTotal;

// Variável para o gráfico
let progressChart;

function playSound() {
    // Funcionalidade de sons totalmente desativada por escolha do usuário.
}

// --- NAVEGAÇÃO POR ABAS ---

function openTab(event, tabId) {
    // Esconde todos os conteúdos
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Mostra a selecionada
    document.getElementById(tabId).classList.add('active');
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // Redesenha o gráfico se for para a aba do checklist ou progresso
    if ((tabId === 'checklistTab' || tabId === 'progressTab') && progressChart) {
        updateChart();
    }
    if (tabId === 'habitsTab') {
        renderHabits();
    }
}

function showSplashScreen() {
    splashScreen.classList.remove('splash-hidden');
    localStorage.removeItem('appStarted');
}

// --- FUNÇÕES DE LISTA (Checklist) ---

function applyTheme(theme) {
    themeSelect.value = theme;
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
    layoutSelect.value = layout;
    localStorage.setItem('layout', layout);
}

function addTask() {
    const text = taskInput.value.trim();
    const date = viewDateInput.value;
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
                // Confetti burst!
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4a90e2', '#2ecc71', '#f1c40f']
                });
            } else {
                // Remoção do XP na desmarcação (ponto fantasma reparado)
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
    taskList.innerHTML = "";
    let filtered = tasks.filter(t => t.date === viewDateInput.value);

    // Sorting: High -> Medium -> Low
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

// --- LÓGICA DO GRÁFICO (LINHA) ---

function getDaysInRange() {
    const period = reportPeriodSelect.value;
    const days = [];
    const now = new Date();
    let count = 7; // Padrão semanal

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

if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', () => {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        updateChart();
    });
}

function updateChart() {
    const days = getDaysInRange();
    const type = chartTypeSelect ? chartTypeSelect.value : 'line';
    
    // Configurações padrão
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

    // Resumo numérico (do período todo)
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
                backgroundColor: accentColor + '33', // Transparência
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

    if (!progressChart) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        progressChart = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    } else {
        // Se mudou o tipo de linha/bar para pie, ou horizontal, o destroy() foi chamado no listener
        progressChart.data = chartData;
        progressChart.options = chartOptions;
        progressChart.update();
    }
}

// --- LÓGICA DO BLOCO DE NOTAS ---

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
    folderListUI.innerHTML = "";
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.className = `folder-item ${folder.id === currentFolderId ? 'active' : ''}`;

        // Create elements
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
        if (folder.id !== 1) { // Prevent deleting the general folder
            li.appendChild(delBtn);
        }

        folderListUI.appendChild(li);
    });

    // Atualizar dropdown de mover pasta
    if (moveFolderSelect) {
        moveFolderSelect.innerHTML = folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    }
}

function deleteFolder(id) {
    if (confirm("Excluir esta pasta também apagará todas as notas nela. Confirmar?")) {
        folders = folders.filter(f => f.id !== id);
        notes = notes.filter(n => n.folderId !== id);
        if (currentFolderId === id) {
            currentFolderId = folders[0].id;
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
    if (note) {
        noteTitleInput.value = note.title;
        noteTextInput.innerHTML = note.content;
        if (moveFolderSelect) moveFolderSelect.value = note.folderId;
        showEditor(true);
        renderNotes();
    }
}

function showEditor(visible) {
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
        note.title = noteTitleInput.value;
        note.content = noteTextInput.innerHTML;
        if (moveFolderSelect) note.folderId = parseInt(moveFolderSelect.value);

        saveNotes();
        renderNotes();
        alert("Nota salva com sucesso!");

        // Se a pasta mudou, talvez a nota nem deva mais estar na lista atual dependendo de como visualizamos,
        // mas force o refresh:
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

// --- LÓGICA DE ATALHOS ---

function addShortcut() {
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

// --- LÓGICA DE HÁBITOS ---

function addHabit() {
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
        while (habit.history[tempD.toISOString().split('T')[0]]) {
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
            const done = habit.history[date];
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

function updateClock() {
    if (!digitalClock) return;
    const now = new Date();
    digitalClock.textContent = now.toLocaleTimeString('pt-BR');
}

function updateWeather() {
    if (!weatherWidget) return;
    const icons = ['☀️', '🌤️', '⛅', '🌥️', '🌦️'];
    const iconsMap = { '☀️': 'Ensolarado', '🌤️': 'Parcialmente Nublado', '⛅': 'Nublado', '🌥️': 'Muito Nublado', '🌦️': 'Chuva Fraca' };
    const rand = Math.floor(Math.random() * icons.length);
    weatherWidget.innerHTML = `${icons[rand]} 24°C — ${iconsMap[icons[rand]]}`;
}

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

// --- LÓGICA DE FOCO (POMODORO) ---

function updatePomoUI() {
    if (!pomoMinutesUI) return;
    const m = Math.floor(pomoTimeLeft / 60);
    const s = pomoTimeLeft % 60;
    pomoMinutesUI.textContent = m.toString().padStart(2, '0');
    pomoSecondsUI.textContent = s.toString().padStart(2, '0');
}

function setPomodoroTime(minutes) {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoTimeTotal = minutes * 60;
    pomoTimeLeft = pomoTimeTotal;
    if (pomoStatusUI) pomoStatusUI.textContent = minutes === 25 ? "Modo Foco" : "Pausa";
    updatePomoUI();
}

if (startPomoBtn) startPomoBtn.addEventListener('click', () => {
    if (pomoInterval) return;
    pomoInterval = setInterval(() => {
        pomoTimeLeft--;
        updatePomoUI();
        if (pomoTimeLeft <= 0) {
            clearInterval(pomoInterval);
            pomoInterval = null;
            playSound();
            if (gamificationEnabled) addXP(25);
            alert("Tempo esgotado!" + (gamificationEnabled ? " Você ganhou 25 XP!" : ""));
            pomoTimeLeft = pomoTimeTotal;
            updatePomoUI();
        }
    }, 1000);
});

if (pausePomoBtn) pausePomoBtn.addEventListener('click', () => {
    clearInterval(pomoInterval);
    pomoInterval = null;
});

if (resetPomoBtn) resetPomoBtn.addEventListener('click', () => {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoTimeLeft = pomoTimeTotal;
    updatePomoUI();
});

let zenModeActive = false;
const toggleZenModeBtn = document.getElementById('toggleZenMode');
if (toggleZenModeBtn) {
    toggleZenModeBtn.addEventListener('click', () => {
        zenModeActive = !zenModeActive;
        if (zenModeActive) {
            document.body.classList.add('zen-mode');
            toggleZenModeBtn.innerHTML = "🧘 Sair do Modo Zen";
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.body.classList.remove('zen-mode');
            toggleZenModeBtn.innerHTML = "🧘 Modo Zen";
            if (document.fullscreenElement) document.exitFullscreen();
        }
    });
}

// --- LÓGICA DE BACKUP (IMPORT/EXPORT) ---
if (exportDataBtn) exportDataBtn.addEventListener('click', () => {
    const data = {
        tasks, folders, notes, shortcuts,
        settings: { currentTheme, currentLayout }
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
                if (data.settings) {
                    if (data.settings.currentTheme) localStorage.setItem('theme', data.settings.currentTheme);
                    if (data.settings.currentLayout) localStorage.setItem('layout', data.settings.currentLayout);
                    if (data.settings.soundsEnabled !== undefined) localStorage.setItem('soundsEnabled', JSON.stringify(data.settings.soundsEnabled));
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

// --- ÁUDIO MEMOS ---
let mediaRecorder;
let audioChunks = [];

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
                            // auto save
                            const note = notes.find(n => n.id === currentNoteId);
                            if (note) {
                                note.content = noteTextInput.innerHTML;
                                saveNotes();
                            }
                        }
                    }
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

// --- EVENTOS E INCIALIZAÇÃO ---

themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
layoutSelect.addEventListener('change', (e) => applyLayout(e.target.value));
viewDateInput.addEventListener('change', () => { renderTasks(); if (reportPeriodSelect.value === 'daily') updateChart(); });
reportPeriodSelect.addEventListener('change', (e) => {
    customRangeDiv.classList.toggle('hidden', e.target.value !== 'custom');
    updateChart();
});
startDateInput.addEventListener('change', updateChart);
endDateInput.addEventListener('change', updateChart);
addTaskBtn.addEventListener('click', () => { addTask(); updateDashboard(); });
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { addTask(); updateDashboard(); } });

// Eventos de Atalhos
addShortcutBtn.addEventListener('click', addShortcut);
shortcutNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addShortcut(); });
shortcutUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addShortcut(); });

// Splash Screen
startAppBtn.addEventListener('click', () => {
    splashScreen.classList.add('splash-hidden');
    localStorage.setItem('appStarted', 'true');
});

// Modal de Configurações
openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});
resetAllBtn.addEventListener('click', () => {
    if (confirm("🚨 ATENÇÃO: Deseja apagar todas as tarefas, pastas, notas e atalhos permanentemente?")) {
        localStorage.clear();
        location.reload();
    }
});

// Inicialização Final
if (localStorage.getItem('appStarted') === 'true') {
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

// Media Query para auto-theme
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (themeSelect.value === 'system') {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'white');
            if (progressChart) updateChart();
        }
    });
}


// --- INTEGRAÇÃO: AMBIENT, XP, SEARCH, PIN, DASHBOARD ---

function updateXP() {
    let level = Math.floor(Math.max(0, userXP) / 100) + 1;
    if (xpBadge) {
        xpBadge.textContent = `Nível ${level} (${userXP} XP)`;
        xpBadge.style.display = gamificationEnabled ? 'inline-block' : 'none';
    }
}

function addXP(amount) {
    if (!gamificationEnabled) return;
    userXP += amount;
    if (userXP < 0) userXP = 0; // Impede saldo negativo
    localStorage.setItem('userXP', userXP);
    updateXP();
}

// Ambient removido

// Universal Search
if (openSearchBtn) openSearchBtn.addEventListener('click', () => { searchModal.classList.remove('hidden'); searchInput.focus(); });
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') { e.preventDefault(); searchModal.classList.remove('hidden'); searchInput.focus(); }
    if (e.key === 'Escape') { searchModal.classList.add('hidden'); }
});
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        searchResults.innerHTML = '';
        if (!q) return;

        let res = [];
        tasks.filter(t => t.text.toLowerCase().includes(q) && !t.completed).forEach(t => res.push(`<li>✅ Tarefa: ${t.text}</li>`));
        notes.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q))).forEach(n => res.push(`<li style="cursor:pointer;" onclick="searchModal.classList.add('hidden'); openTab(null, 'notesTab'); openNote(${n.id});">📄 Nota: ${n.title}</li>`));
        shortcuts.filter(s => s.name.toLowerCase().includes(q)).forEach(s => res.push(`<li>🔗 Atalho: <a href="${s.url}" target="_blank">${s.name}</a></li>`));

        searchResults.innerHTML = res.map(r => `<div style="padding: 10px; border-bottom: 1px solid var(--border-color);">${r}</div>`).join('');
    });
}

// Consolidated Dashboard Update
function updateDashboard() {
    // 1. Welcome Greeting
    if (welcomeText) {
        const hour = new Date().getHours();
        let greeting = "Boa noite!";
        let emoji = "🌙";
        if (hour >= 5 && hour < 12) { greeting = "Bom dia!"; emoji = "☀️"; }
        else if (hour >= 12 && hour < 18) { greeting = "Boa tarde!"; emoji = "☕"; }

        const emojiSpan = emojisEnabled ? `<span class="emoji">${emoji}</span>` : "";
        welcomeText.innerHTML = `${greeting} ${emojiSpan} Pronto para evoluir?`;
    }

    // 2. Motivacional Phrase
    const dailyQuoteEl = document.getElementById('dailyQuote');
    if (dailyQuoteEl) dailyQuoteEl.textContent = customQuote;

    // 3. Vencendo Hoje (Tasks + Habits)
    if (highPriorityList) {
        highPriorityList.innerHTML = "";
        const todayStr = new Date().toISOString().split('T')[0];

        // Alta hoje (independentemente do que está no viewDateInput)
        const highToday = tasks.filter(t => t.date === todayStr && t.priority === 'high' && !t.completed);

        // Hábitos não realizados hoje
        const pendingHabits = habits.filter(h => !h.history || !h.history[todayStr]);

        let items = [];

        highToday.forEach(t => {
            const sym = emojisEnabled ? '🔴' : '<b>[Alta]</b>';
            items.push(`<li class="task-item" style="margin: 0; border-left: 4px solid #e74c3c; padding: 10px; background: var(--bg-color);" onclick="openTab(null, 'checklistTab'); viewDateInput.value = '${t.date}'; renderTasks();">
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

    // 4. Update Summary
    updateDashboardSummary();
}

// Timers
setInterval(updateClock, 1000);
updateClock();
updateWeather();
updateDashboard();
renderHabits();

// Cofre
if (userPIN) {
    lockScreen.classList.remove('hidden');
    unlockBtn.addEventListener('click', () => {
        if (pinInput.value === userPIN) {
            lockScreen.classList.add('hidden');
        } else {
            pinError.style.display = 'block';
        }
    });
}
if (savePinBtn) {
    if (userPIN) pinSettingsInput.value = userPIN;
    savePinBtn.addEventListener('click', () => {
        const p = pinSettingsInput.value.trim();
        if (p.length === 0) { localStorage.removeItem('userPIN'); alert('Cofre desativado.'); }
        else if (p.length === 4) { localStorage.setItem('userPIN', p); alert('PIN salvo com sucesso!'); }
        else { alert('O PIN precisa ter exatos 4 dígitos.'); }
    });
}



function editQuote() {
    const newQ = prompt("Digite sua nova frase motivacional:", customQuote);
    if (newQ !== null && newQ.trim() !== '') {
        customQuote = newQ.trim();
        localStorage.setItem('customQuote', customQuote);
        updateDashboard();
    }
}

applyTheme(currentTheme);
applyLayout(currentLayout);
updateXP();
updateDashboard();
saveAndRender();
renderFolders();
renderNotes();
renderShortcuts();
updatePomoUI();

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
