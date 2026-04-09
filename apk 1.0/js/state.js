// State Management
const AppState = {
    // Carregamento inicial com sanitização de tipos
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    folders: JSON.parse(localStorage.getItem('folders')) || [{ id: 1, name: 'Geral' }],
    notes: JSON.parse(localStorage.getItem('notes')) || [],
    shortcuts: JSON.parse(localStorage.getItem('shortcuts')) || [],
    habits: JSON.parse(localStorage.getItem('habits')) || [],
    
    // Configurações (Strings diretas)
    currentTheme: localStorage.getItem('theme') || 'system',
    currentLayout: localStorage.getItem('layout') || 'default',
    customQuote: localStorage.getItem('customQuote') || '"Ação é a chave fundamental para todo sucesso."',
    
    // Flags (Booleanos)
    emojisEnabled: localStorage.getItem('emojisEnabled') !== null ? JSON.parse(localStorage.getItem('emojisEnabled')) : true,
    gamificationEnabled: localStorage.getItem('gamificationEnabled') !== null ? JSON.parse(localStorage.getItem('gamificationEnabled')) : true,
    gridsEnabled: localStorage.getItem('gridsEnabled') !== null ? JSON.parse(localStorage.getItem('gridsEnabled')) : true,
    
    userXP: parseInt(localStorage.getItem('userXP')) || 0,
    userPIN: localStorage.getItem('userPIN'),

    currentFolderId: 1,
    currentNoteId: null,

    // Sincronização inteligente
    sync(key) {
        // Mapeamento de chaves de estado para chaves de LocalStorage (compatibilidade legado)
        const keyMap = {
            'currentTheme': 'theme',
            'currentLayout': 'layout'
        };
        
        const storageKey = keyMap[key] || key;
        const value = this[key];

        if (typeof value === 'string' && key !== 'tasks' && key !== 'folders' && key !== 'notes' && key !== 'shortcuts' && key !== 'habits') {
            localStorage.setItem(storageKey, value);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(value));
        }
    },
    
    addXP(amount) {
        if (!this.gamificationEnabled) return;
        this.userXP = Math.max(0, this.userXP + amount);
        localStorage.setItem('userXP', this.userXP);
        document.dispatchEvent(new Event('app:xpChanged'));
    }
};

AppState.currentFolderId = AppState.folders[0]?.id || 1;
