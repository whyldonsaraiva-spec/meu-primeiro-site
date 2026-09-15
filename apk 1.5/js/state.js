// --- GERENCIAMENTO DE ESTADO E PERSISTÊNCIA (state.js) ---

// Elementos DOM compartilhados
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

const taskPriority = document.getElementById('taskPriority');

// Elementos do Modal de Opções de Tarefas (Importar / Exportar)
const taskOptionsModal = document.getElementById('taskOptionsModal');
const tabImportBtn = document.getElementById('tabImportBtn');
const tabExportBtn = document.getElementById('tabExportBtn');
const optionsImportContent = document.getElementById('optionsImportContent');
const optionsExportContent = document.getElementById('optionsExportContent');

const importTargetDateDisplay = document.getElementById('importTargetDateDisplay');
const importSourceDateInput = document.getElementById('importSourceDateInput');
const importTaskList = document.getElementById('importTaskList');

const exportSourceDateDisplay = document.getElementById('exportSourceDateDisplay');
const exportTaskList = document.getElementById('exportTaskList');
const langSelect = document.getElementById('langSelect');
const exportStartDateInput = document.getElementById('exportStartDateInput');
const exportEndDateInput = document.getElementById('exportEndDateInput');

let exportTargetDatesList = [];

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

// Cofre & Busca
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

// Dados Principais do App
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let folders = JSON.parse(localStorage.getItem('folders')) || [{ id: 1, name: 'Geral' }];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];

let currentTheme = localStorage.getItem('theme') || 'system';
let currentLayout = localStorage.getItem('layout') || 'default';
let currentLanguage = localStorage.getItem('language') || 'pt';
let customQuote = localStorage.getItem('customQuote') || '"Ação é a chave fundamental para todo sucesso."';

let emojisEnabled = JSON.parse(localStorage.getItem('emojisEnabled'));
if (emojisEnabled === null) emojisEnabled = true;

let gamificationEnabled = JSON.parse(localStorage.getItem('gamificationEnabled'));
if (gamificationEnabled === null) gamificationEnabled = true;

let gridsEnabled = JSON.parse(localStorage.getItem('gridsEnabled'));
if (gridsEnabled === null) gridsEnabled = true;

let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userPIN = localStorage.getItem('userPIN');

// Estados de Seleção
let currentFolderId = folders[0] ? folders[0].id : 1;
let currentNoteId = null;

let progressChart = null;
let mediaRecorder = null;
let audioChunks = [];

// Dicionário de Traduções Abrangente (i18n 100%)
const i18n = {
    pt: {
        // Splash Screen
        splashTitle: "Bem-vindo ao Next",
        splashSubtitle: "Sua ferramenta completa e moderna para produtividade, anotações e atalhos.",
        splashStartBtn: "Começar Agora",
        
        // Header & Navigation
        badgeLevel: "Nível",
        badgeXp: "XP",
        headerHomeBtn: "Voltar ao Início",
        headerSearchBtn: "Busca (Ctrl+K)",
        headerSettingsBtn: "Configurações",
        tabHome: "Início",
        tabChecklist: "Checklist",
        tabProgress: "Progresso",
        tabNotes: "Notas",
        tabHabits: "Hábitos",
        tabShortcuts: "Atalhos",

        // Dashboard Tab
        greetingMorning: "Bom dia!",
        greetingAfternoon: "Boa tarde!",
        greetingEvening: "Boa noite!",
        readyToEvolve: "Pronto para evoluir?",
        editQuoteBtn: "Editar Frase",
        weatherLoading: "Carregando clima...",
        quickActionsTitle: "Ações Rápidas",
        quickTaskBtn: "+ Tarefa",
        quickNoteBtn: "+ Nota",
        quickOptionsBtn: "Opções",
        quickSettingsBtn: "⚙️ Opções",
        dailySummaryTitle: "Resumo Diário",
        analyzingPerformance: "Analisando seu desempenho...",
        noYesterdayTasks: "Nenhuma tarefa registrada ontem. Vamos fazer um dia incrível hoje?",
        yesterdaySummaryPart1: "Ontem você completou",
        yesterdaySummaryPart2: "tarefas",
        yesterdaySummaryEncourageHigh: "Continue com esse ritmo!",
        yesterdaySummaryEncourageLow: "Hoje é um novo dia para brilhar.",
        dueTodayTitle: "🔥 Vencendo Hoje",
        nothingPending: "Nenhuma pendente!",

        // Checklist Tab
        viewingTasksOf: "Visualizando tarefas de:",
        prevDayTooltip: "Dia anterior",
        nextDayTooltip: "Próximo dia",
        checklistOptionsBtn: "Opções",
        taskInputPlaceholder: "O que você precisa fazer?",
        priorityLow: "Baixa",
        priorityMedium: "Média",
        priorityHigh: "Alta",
        addTaskBtn: "Adicionar",
        noTasksForDay: "Nada para este dia.",
        deleteBtn: "Apagar",

        // Progress Tab
        progressReportsTitle: "Relatórios de Progresso",
        periodToday: "Hoje",
        periodWeekly: "Semanal",
        periodMonthly: "Mensal",
        periodQuarterly: "Trimestral",
        periodSemiannual: "Semestral",
        periodAnnual: "Anual",
        periodCustom: "Personalizado",
        chartTypeLine: "Linha",
        chartTypeBar: "Coluna",
        chartTypeHorizontalBar: "Barra",
        chartTypePie: "Pizza",
        chartTypeArea: "Área",
        chartTypeHistogram: "Histograma",
        statTotal: "Total",
        statCompleted: "Feitas",
        statPending: "Pendentes",
        statRate: "Taxa",
        chartCompletedPct: "% Concluído",
        chartDone: "Feito",
        chartPending: "Pendente",

        // Notes Tab
        foldersTitle: "Pastas",
        addFolderBtn: "+ Pasta",
        notesTitle: "Notas",
        addNoteBtn: "+ Nota",
        notesEmptyState: "Selecione ou crie uma nota para começar a escrever.",
        noteTitlePlaceholder: "Título da Nota",
        formatListBtn: "• Lista",
        recordAudioBtn: "🎤 Gravar Áudio",
        stopAudioBtn: "⏹️ Parar",
        noteTextPlaceholder: "Comece a escrever aqui...",
        saveNoteBtn: "Salvar Nota",
        deleteNoteBtn: "Excluir Nota",
        generalFolder: "Geral",
        newNoteDefaultTitle: "Nova Nota",

        // Habits Tab
        habitsTitle: "Meus Hábitos",
        habitsSubtitle: "Mantenha a consistência para subir de nível!",
        habitInputPlaceholder: "Ex: Beber 2L de água, Ler 10 páginas...",
        addHabitBtn: "+ Hábito",
        daysStreak: "dias",
        noHabitsYet: "Nenhum hábito cadastrado ainda.",

        // Shortcuts Tab
        shortcutsTitle: "Meus Atalhos",
        shortcutNamePlaceholder: "Nome do Atalho (ex: Google)",
        shortcutUrlPlaceholder: "URL (ex: google.com.br)",
        addShortcutBtn: "Adicionar",

        // Settings Modal
        settingsTitle: "Configurações do Next",
        settingsSubtitle: "Personalize sua experiência visual.",
        langLabel: "Idioma / Language:",
        themeLabel: "Tema:",
        themeSystem: "Sistema (Auto)",
        themeWhite: "White",
        themeDark: "Dark",
        themeHalloween: "Halloween",
        themePastel: "Kwaii",
        themeGothic: "Gótico",
        themeAurora: "Aurora",
        themeMidnight: "Midnight Ocean",
        themeClean: "Clean",
        templateLabel: "Template:",
        templateDefault: "Padrão",
        templateCompact: "Compacto",
        templateModern: "Moderno",
        templateClassic: "Clássico",
        emojisLabel: "Exibir Emojis:",
        xpLabel: "Gamificação (XP):",
        gridLabel: "Grades nos Gráficos:",
        pinLabel: "Bloqueio por PIN:",
        pinPlaceholder: "4 dígitos",
        savePinBtn: "Salvar",
        dataLabel: "Dados:",
        exportDataBtn: "⬇️ Exportar",
        importDataBtn: "⬆️ Importar",
        resetAllBtn: "🚨 Apagar Tudo",
        closeBtn: "Fechar",

        // Vault Lock Screen
        vaultTitle: "🔒 Cofre Next",
        vaultSubtitle: "Digite seu PIN para acessar.",
        unlockBtn: "Desbloquear",
        pinError: "PIN Incorreto!",

        // Search Modal & Dashboard
        searchPlaceholder: "🔍 Buscar tarefas, notas, hábitos... (Esc para sair)",
        searchTaskPrefix: "✅ Tarefa:",
        searchNotePrefix: "📄 Nota:",
        searchShortcutPrefix: "🔗 Atalho:",
        taskPrefix: "Tarefa:",
        habitPrefix: "Hábito:",

        // Task Options Modal
        taskOptionsTitle: "Opções de Tarefas",
        tabImportTitle: "Importar de outra data",
        tabExportTitle: "Exportar para outra data",
        importDesc: "Escolha a data de origem para copiar tarefas para o dia",
        importSourceLabel: "Data de Origem:",
        selectAllBtn: "Selecionar Todas",
        cancelBtn: "Cancelar",
        confirmImportBtn: "Importar Selecionadas",
        exportDesc: "Selecione as tarefas do dia",
        exportDescPart2: "e escolha as datas para onde deseja exportá-las:",
        exportStep1: "1. Selecione as tarefas a exportar:",
        exportStep2: "2. Escolha o intervalo de datas de destino:",
        dateFrom: "De:",
        dateTo: "Até:",
        addRangeBtn: "+ Adicionar Intervalo",
        confirmExportBtn: "Exportar Tarefas"
    },
    en: {
        // Splash Screen
        splashTitle: "Welcome to Next",
        splashSubtitle: "Your complete and modern tool for productivity, notes, and shortcuts.",
        splashStartBtn: "Start Now",
        
        // Header & Navigation
        badgeLevel: "Level",
        badgeXp: "XP",
        headerHomeBtn: "Back to Home",
        headerSearchBtn: "Search (Ctrl+K)",
        headerSettingsBtn: "Settings",
        tabHome: "Home",
        tabChecklist: "Checklist",
        tabProgress: "Progress",
        tabNotes: "Notes",
        tabHabits: "Habits",
        tabShortcuts: "Shortcuts",

        // Dashboard Tab
        greetingMorning: "Good morning!",
        greetingAfternoon: "Good afternoon!",
        greetingEvening: "Good evening!",
        readyToEvolve: "Ready to evolve?",
        editQuoteBtn: "Edit Quote",
        weatherLoading: "Loading weather...",
        quickActionsTitle: "Quick Actions",
        quickTaskBtn: "+ Task",
        quickNoteBtn: "+ Note",
        quickOptionsBtn: "Options",
        quickSettingsBtn: "⚙️ Options",
        dailySummaryTitle: "Daily Summary",
        analyzingPerformance: "Analyzing your performance...",
        noYesterdayTasks: "No tasks recorded yesterday. Let's make today awesome!",
        yesterdaySummaryPart1: "Yesterday you completed",
        yesterdaySummaryPart2: "tasks",
        yesterdaySummaryEncourageHigh: "Keep up the great momentum!",
        yesterdaySummaryEncourageLow: "Today is a new day to shine.",
        dueTodayTitle: "🔥 Due Today",
        nothingPending: "Nothing pending!",

        // Checklist Tab
        viewingTasksOf: "Viewing tasks for:",
        prevDayTooltip: "Previous day",
        nextDayTooltip: "Next day",
        checklistOptionsBtn: "Options",
        taskInputPlaceholder: "What do you need to do?",
        priorityLow: "Low",
        priorityMedium: "Medium",
        priorityHigh: "High",
        addTaskBtn: "Add",
        noTasksForDay: "Nothing for this day.",
        deleteBtn: "Delete",

        // Progress Tab
        progressReportsTitle: "Progress Reports",
        periodToday: "Today",
        periodWeekly: "Weekly",
        periodMonthly: "Monthly",
        periodQuarterly: "Quarterly",
        periodSemiannual: "Semi-annual",
        periodAnnual: "Annual",
        periodCustom: "Custom",
        chartTypeLine: "Line",
        chartTypeBar: "Bar",
        chartTypeHorizontalBar: "Horizontal Bar",
        chartTypePie: "Pie",
        chartTypeArea: "Area",
        chartTypeHistogram: "Histogram",
        statTotal: "Total",
        statCompleted: "Done",
        statPending: "Pending",
        statRate: "Rate",
        chartCompletedPct: "% Completed",
        chartDone: "Done",
        chartPending: "Pending",

        // Notes Tab
        foldersTitle: "Folders",
        addFolderBtn: "+ Folder",
        notesTitle: "Notes",
        addNoteBtn: "+ Note",
        notesEmptyState: "Select or create a note to start writing.",
        noteTitlePlaceholder: "Note Title",
        formatListBtn: "• List",
        recordAudioBtn: "🎤 Record Audio",
        stopAudioBtn: "⏹️ Stop",
        noteTextPlaceholder: "Start typing here...",
        saveNoteBtn: "Save Note",
        deleteNoteBtn: "Delete Note",
        generalFolder: "General",
        newNoteDefaultTitle: "New Note",

        // Habits Tab
        habitsTitle: "My Habits",
        habitsSubtitle: "Keep consistency to level up!",
        habitInputPlaceholder: "Ex: Drink 2L of water, Read 10 pages...",
        addHabitBtn: "+ Habit",
        daysStreak: "days",
        noHabitsYet: "No habits created yet.",

        // Shortcuts Tab
        shortcutsTitle: "My Shortcuts",
        shortcutNamePlaceholder: "Shortcut Name (ex: Google)",
        shortcutUrlPlaceholder: "URL (ex: google.com)",
        addShortcutBtn: "Add",

        // Settings Modal
        settingsTitle: "Next Settings",
        settingsSubtitle: "Customize your visual experience.",
        langLabel: "Idioma / Language:",
        themeLabel: "Theme:",
        themeSystem: "System (Auto)",
        themeWhite: "White",
        themeDark: "Dark",
        themeHalloween: "Halloween",
        themePastel: "Pastel",
        themeGothic: "Gothic",
        themeAurora: "Aurora",
        themeMidnight: "Midnight Ocean",
        themeClean: "Clean",
        templateLabel: "Template:",
        templateDefault: "Default",
        templateCompact: "Compact",
        templateModern: "Modern",
        templateClassic: "Classic",
        emojisLabel: "Show Emojis:",
        xpLabel: "Gamification (XP):",
        gridLabel: "Chart Grids:",
        pinLabel: "PIN Lock:",
        pinPlaceholder: "4 digits",
        savePinBtn: "Save",
        dataLabel: "Data:",
        exportDataBtn: "⬇️ Export",
        importDataBtn: "⬆️ Import",
        resetAllBtn: "🚨 Delete All",
        closeBtn: "Close",

        // Vault Lock Screen
        vaultTitle: "🔒 Next Vault",
        vaultSubtitle: "Enter your PIN to access.",
        unlockBtn: "Unlock",
        pinError: "Incorrect PIN!",

        // Search Modal & Dashboard
        searchPlaceholder: "🔍 Search tasks, notes, habits... (Esc to exit)",
        searchTaskPrefix: "✅ Task:",
        searchNotePrefix: "📄 Note:",
        searchShortcutPrefix: "🔗 Shortcut:",
        taskPrefix: "Task:",
        habitPrefix: "Habit:",

        // Task Options Modal
        taskOptionsTitle: "Task Options",
        tabImportTitle: "Import from another date",
        tabExportTitle: "Export to another date",
        importDesc: "Choose source date to copy tasks to day",
        importSourceLabel: "Source Date:",
        selectAllBtn: "Select All",
        cancelBtn: "Cancel",
        confirmImportBtn: "Import Selected",
        exportDesc: "Select tasks from day",
        exportDescPart2: "and choose target dates to export to:",
        exportStep1: "1. Select tasks to export:",
        exportStep2: "2. Select target date range:",
        dateFrom: "From:",
        dateTo: "To:",
        addRangeBtn: "+ Add Range",
        confirmExportBtn: "Export Tasks"
    }
};
