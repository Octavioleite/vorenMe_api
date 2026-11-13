import { activeUntil, isPublished } from "../../utils/plan.js";

// Nunca inclui o password.
export default class ListUserDto {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createAt = data.createAt;
    this.activeUntil = activeUntil(data);
    this.emailVerified = Boolean(data.emailVerifiedAt);
    this.published = isPublished(data); // cartões abertos ao público (utils/plan.js)
  }
}
