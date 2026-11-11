import { cleanOrigin } from "../../utils/origin.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class RegisterUserDto {
  constructor(data = {}) {
    this.name = typeof data.name === "string" ? data.name.trim() : undefined;
    this.email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
    this.password = data.password;
    this.origin = cleanOrigin(data.origin);
    this.ref = typeof data.ref === "string" ? data.ref.slice(0, 40) : undefined;
  }

  validate() {
    const errors = [];

    if (!this.email || !EMAIL.test(this.email)) {
      errors.push("Informe um e-mail válido.");
    }

    if (typeof this.password !== "string" || this.password.length < 8) {
      errors.push("A senha precisa ter pelo menos 8 caracteres.");
    }

    if (typeof this.password === "string" && this.password.length > 128) {
      errors.push("A senha pode ter no máximo 128 caracteres.");
    }

    return errors;
  }
}
