// State Management
const AppState = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    folders: JSON.parse(localStorage.getItem('folders')) || [{ id: 1, name: 'Geral' }],
    notes: JSON.parse(localStorage.getItem('notes')) || [],
    shortcuts: JSON.parse(localStorage.getItem('shortcuts')) || [],
    habits: JSON.parse(localStorage.getItem('habits')) || [],
    
    currentTheme: localStorage.getItem('theme') || 'system',
    currentLayout: localStorage.getItem('layout') || 'default',
    customQuote: localStorage.getItem('customQuote') || '"Ação é a chave fundamental para todo sucesso."',
    
    emojisEnabled: JSON.parse(localStorage.getItem('emojisEnabled')) ?? true,
    gamificationEnabled: JSON.parse(localStorage.getItem('gamificationEnabled')) ?? true,
    gridsEnabled: JSON.parse(localStorage.getItem('gridsEnabled')) ?? true,
    
    userXP: parseInt(localStorage.getItem('userXP')) || 0,
    userPIN: localStorage.getItem('userPIN'),

    currentFolderId: 1,
    currentNoteId: null,

    // Methods
    sync(key) {
        if(this.hasOwnProperty(key)) {
            localStorage.setItem(key, JSON.stringify(this[key]));
        } else {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            localStorage.setItem('folders', JSON.stringify(this.folders));
            localStorage.setItem('notes', JSON.stringify(this.notes));
            localStorage.setItem('shortcuts', JSON.stringify(this.shortcuts));
            localStorage.setItem('habits', JSON.stringify(this.habits));
        }
    },
    
    addXP(amount) {
        if (!this.gamificationEnabled) return;
        this.userXP = Math.max(0, this.userXP + amount);
        localStorage.setItem('userXP', this.userXP);
        document.dispatchEvent(new Event('app:xpChanged'));
    }
};

// Auto sync polyfill
AppState.currentFolderId = AppState.folders[0]?.id || 1;
