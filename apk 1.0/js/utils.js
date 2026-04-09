// Utilities & Core Functionality

const Utils = {
    // Generate valid Date YYYY-MM-DD regardless of offset
    getLocalISOString: (dateObj = new Date()) => {
        const offset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj - offset)).toISOString().slice(0, -1);
        return localISOTime.split('T')[0];
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    escapeHTML: (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // UI Modals explicitly replacing alert/prompt/confirm
    // To use: CustomModal.alert("Hello").then(...)
    CustomModal: (() => {
        let resolveActive = null;

        const invokeModal = ({ title, message, useInput = false, useCancel = false }) => {
            return new Promise((resolve) => {
                const modal = document.getElementById('customModal');
                const tTitle = document.getElementById('modalTitle');
                const tMsg = document.getElementById('modalMessage');
                const input = document.getElementById('modalInput');
                const btnCancel = document.getElementById('modalCancelBtn');
                const btnConfirm = document.getElementById('modalConfirmBtn');

                if (!modal) return resolve(useInput ? null : false);

                tTitle.textContent = title;
                tMsg.textContent = message;

                if (useInput) {
                    input.classList.remove('hidden');
                    input.value = '';
                    input.focus();
                } else {
                    input.classList.add('hidden');
                }

                btnCancel.style.display = useCancel ? 'inline-block' : 'none';

                modal.classList.remove('hidden');
                modal.setAttribute('aria-hidden', 'false');

                const cleanup = () => {
                    modal.classList.add('hidden');
                    modal.setAttribute('aria-hidden', 'true');
                    btnConfirm.onclick = null;
                    btnCancel.onclick = null;
                };

                btnConfirm.onclick = () => {
                    cleanup();
                    resolve(useInput ? input.value : true);
                };

                btnCancel.onclick = () => {
                    cleanup();
                    resolve(useInput ? null : false);
                };
            });
        };

        return {
            alert: (message, title = "Aviso") => invokeModal({ title, message, useCancel: false }),
            confirm: (message, title = "Confirmação") => invokeModal({ title, message, useCancel: true }),
            prompt: (message, preload = "", title = "Entrada Necessária") => invokeModal({ title, message, useInput: true, useCancel: true })
        };
    })()
};
