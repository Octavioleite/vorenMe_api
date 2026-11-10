export default class ListCardDto {
  constructor(data) {
    this.id = data.id;
    this.slug = data.slug;
    this.template = data.template;
    this.config = data.config;
    this.createAt = data.createAt;
    this.updateAt = data.updateAt;
    this.disabled = Boolean(data.disabledAt); // tirado do ar pela moderação
  }
}
