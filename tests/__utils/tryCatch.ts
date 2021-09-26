export default function tryCatch(callback: () => unknown, fallback?: (error: unknown) => unknown): unknown {
    try {
        return callback();
    } catch (error) {
        return fallback?.(error) ?? null;
    }
}
