import * as cardRepository from "../repository/card.repository.js";
import * as templateService from "./template.service.js";
import ListCardDto from "../dto/card/list.dto.js";
import { httpError } from "../utils/httpError.js";

// Cartão de outro usuário responde 404, igual a um inexistente.
const findOwned = async (userId, id) => {
  const card = await cardRepository.findById(id);
  if (!card || card.userId !== userId) throw httpError(404, "Card not found");
  return card;
};

const assertSlugFree = async (slug, exceptId) => {
  const other = await cardRepository.findBySlug(slug);
  if (other && other.id !== exceptId) throw httpError(409, "Slug already in use");
};

// A unique do banco cobre a corrida entre a checagem e o insert.
const uniqueSlug = (error) => {
  if (error?.code === "P2002") throw httpError(409, "Slug already in use");
  throw error;
};

export const list = async (userId) => {
  const cards = await cardRepository.findAllByUser(userId);
  return cards.map((card) => new ListCardDto(card));
};

export const register = async (userId, dto) => {
  const template = templateService.findById(dto.template);
  if (!template) throw httpError(400, "Template not found");

  await assertSlugFree(dto.slug);

  const card = await cardRepository
    .registerCard({
      userId,
      slug: dto.slug,
      template: template.id,
      config: { ...structuredClone(template.config), username: dto.slug },
    })
    .catch(uniqueSlug);

  return new ListCardDto(card);
};

export const update = async (userId, id, dto) => {
  await findOwned(userId, id);

  if (dto.slug !== undefined) await assertSlugFree(dto.slug, id);

  const data = {};
  if (dto.slug !== undefined) data.slug = dto.slug;
  if (dto.config !== undefined) data.config = dto.config;

  const card = await cardRepository.saveCard(id, data).catch(uniqueSlug);
  return new ListCardDto(card);
};

export const remove = async (userId, id) => {
  await findOwned(userId, id);
  await cardRepository.deleteCard(id);
};

export const getPublicBySlug = async (slug) => {
  const card = await cardRepository.findBySlug(String(slug).toLowerCase());
  if (!card) throw httpError(404, "Card not found");
  return card.config;
};
