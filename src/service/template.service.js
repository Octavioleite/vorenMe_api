import templates from "../templates/index.js";

export const list = () => templates;

export const findById = (id) => templates.find((t) => t.id === id);
