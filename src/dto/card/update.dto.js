import { validateCardConfig, validateSlug } from "./config.js";

// undefined = não mexe.
export default class UpdateCardDto {
  constructor(data = {}) {
    this.slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : data.slug;
    this.config = data.config;
  }

  validate() {
    const errors = [];

    if (this.slug !== undefined) {
      errors.push(...validateSlug(this.slug));
    }

    if (this.config !== undefined) {
      errors.push(...validateCardConfig(this.config));
    }

    return errors;
  }
}
