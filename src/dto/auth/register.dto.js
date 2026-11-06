const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class RegisterUserDto {
  constructor(data = {}) {
    this.name = typeof data.name === "string" ? data.name.trim() : undefined;
    this.email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    if (!this.email || !EMAIL.test(this.email)) {
      errors.push("A valid email is required");
    }

    if (typeof this.password !== "string" || this.password.length < 8) {
      errors.push("Password must have at least 8 characters");
    }

    if (typeof this.password === "string" && this.password.length > 128) {
      errors.push("Password must have at most 128 characters");
    }

    return errors;
  }
}
