// --- FUNÇÕES UTILITÁRIAS E AJUDANTES (utils.js) ---

function playSound() {
    // Funcionalidade de sons opcional/desativada por escolha do usuário.
}

function updateXP() {
    let level = Math.floor(Math.max(0, userXP) / 100) + 1;
    const t = i18n[currentLanguage] || i18n.pt;
    if (xpBadge) {
        xpBadge.textContent = `${t.badgeLevel || 'Nível'} ${level} (${userXP} XP)`;
        xpBadge.style.display = gamificationEnabled ? 'inline-block' : 'none';
    }
}

function addXP(amount) {
    if (!gamificationEnabled) return;
    userXP += amount;
    if (userXP < 0) userXP = 0;
    localStorage.setItem('userXP', userXP);
    updateXP();
}

function updateClock() {
    if (!digitalClock) return;
    const now = new Date();
    digitalClock.textContent = now.toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'pt-BR');
}

function updateWeather() {
    if (!weatherWidget) return;
    const icons = ['☀️', '🌤️', '⛅', '🌥️', '🌦️'];
    const iconsMapPt = { '☀️': 'Ensolarado', '🌤️': 'Parcialmente Nublado', '⛅': 'Nublado', '🌥️': 'Muito Nublado', '🌦️': 'Chuva Fraca' };
    const iconsMapEn = { '☀️': 'Sunny', '🌤️': 'Partly Cloudy', '⛅': 'Cloudy', '🌥️': 'Very Cloudy', '🌦️': 'Light Rain' };
    const map = currentLanguage === 'en' ? iconsMapEn : iconsMapPt;
    const rand = Math.floor(Math.random() * icons.length);
    weatherWidget.innerHTML = `${icons[rand]} 24°C — ${map[icons[rand]]}`;
}

function editQuote() {
    const promptMsg = currentLanguage === 'en' ? "Enter your new motivational quote:" : "Digite sua nova frase motivacional:";
    const newQ = prompt(promptMsg, customQuote);
    if (newQ !== null && newQ.trim() !== '') {
        customQuote = newQ.trim();
        localStorage.setItem('customQuote', customQuote);
        updateDashboard();
    }
}
