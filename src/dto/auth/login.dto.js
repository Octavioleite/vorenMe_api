export default class LoginUserDto {
  constructor(data = {}) {
    this.email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    if (!this.email) {
      errors.push("Informe o e-mail.");
    }

    if (!this.password) {
      errors.push("Informe a senha.");
    }

    return errors;
  }
}
