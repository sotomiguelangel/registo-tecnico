// ============================================
// Hook: useFetch
// ============================================

export function useFetch(url, options = {}) {
    let state = {
        data: null,
        error: null,
        loading: false
    };

    let controller = null;

    async function execute(customUrl = url, customOptions = {}) {
        if (controller) {
            controller.abort();
        }
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

        state.loading = true;
        state.error = null;
        if (options.onLoading) options.onLoading(true);

        try {
            const fetchOpts = {
                ...options,
                ...customOptions,
                signal: controller ? controller.signal : undefined
            };

            const response = await fetch(customUrl, fetchOpts);
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            state.data = data;
            state.loading = false;
            if (options.onSuccess) options.onSuccess(data);
            return data;
        } catch (err) {
            if (err.name === 'AbortError') return null;
            state.error = err;
            state.loading = false;
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            state.loading = false;
            if (options.onLoading) options.onLoading(false);
        }
    }

    function cancel() {
        if (controller) {
            controller.abort();
            controller = null;
        }
    }

    if (options.immediate) {
        execute();
    }

    return {
        get data() { return state.data; },
        get error() { return state.error; },
        get loading() { return state.loading; },
        execute,
        cancel
    };
}

export default useFetch;

if (typeof window !== 'undefined') {
    window.useFetch = useFetch;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = useFetch;
    module.exports.useFetch = useFetch;
}
