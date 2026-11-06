// Erro com status HTTP: o service decide o status, o controller só repassa.
export const httpError = (status, message) => Object.assign(new Error(message), { status });
