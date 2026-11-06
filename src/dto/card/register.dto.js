import { validateSlug } from "./config.js";

export default class RegisterCardDto {
  constructor(data = {}) {
    this.slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : data.slug;
    this.template = data.template;
  }

  validate() {
    const errors = validateSlug(this.slug);

    if (!this.template) {
      errors.push("Template is required");
    }

    return errors;
  }
}
