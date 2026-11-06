// Erros com status (httpError) vão como estão; o resto vira 500 sem vazar detalhes.
export const sendError = (res, error, context) => {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(`Error ${context}:`, error);
  return res.status(500).json({ message: "Internal server error" });
};
