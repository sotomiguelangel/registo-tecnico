// ============================================
// Hook: useAuth (Vanilla Reactive)
// ============================================

import { auth } from '../services/auth.js';

export function useAuth(onChange = null) {
    const getState = () => ({
        user: auth.getCurrentUser(),
        isAuthenticated: auth.isAuthenticated(),
        isAdmin: auth.isAdmin(),
        isTechnician: auth.isTechnician(),
        isViewer: auth.isViewer(),
        isLocked: auth.isLocked
    });

    let unsubscribe = null;
    if (typeof onChange === 'function') {
        unsubscribe = auth.subscribe((state) => {
            onChange(getState());
        });
    }

    return {
        ...getState(),
        login: (u, p) => auth.login(u, p),
        logout: () => auth.logout(),
        lock: () => auth.lockSession(),
        unlock: (pin) => auth.unlockSession(pin),
        unsubscribe
    };
}

export default useAuth;

if (typeof window !== 'undefined') {
    window.useAuth = useAuth;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = useAuth;
    module.exports.useAuth = useAuth;
}
