// Erros com status (httpError) vão como estão; o resto vira 500 sem vazar detalhes.
export const sendError = (res, error, context) => {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message, ...(error.errors && { errors: error.errors }) });
  }
  console.error(`Error ${context}:`, error);
  return res.status(500).json({ message: "Algo deu errado. Tente novamente." });
};

// Rota que só devolve o resultado do service: { message: "ok", data }.
export const handle = (context, fn) => async (req, res) => {
  try {
    return res.status(200).json({ message: "ok", data: (await fn(req)) ?? null });
  } catch (error) {
    return sendError(res, error, context);
  }
};
