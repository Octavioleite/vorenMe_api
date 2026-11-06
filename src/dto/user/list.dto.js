// Nunca inclui o password.
export default class ListUserDto {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createAt = data.createAt;
  }
}
