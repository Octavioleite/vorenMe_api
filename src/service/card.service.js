import * as cardRepository from "../repository/card.repository.js";
import * as templateService from "./template.service.js";
import ListCardDto from "../dto/card/list.dto.js";
import * as userRepository from "../repository/user.repository.js";
import { httpError } from "../utils/httpError.js";
import { MAX_CARDS, isActive, isOnline, basicConfig } from "../utils/plan.js";
import prisma from "../lib/prisma.js";

// Slug liberado fica com o antigo dono por SLUG_HOLD_DAYS (ver model SlugHold).
const SLUG_HOLD_DAYS = 30;
export const holdSlugs = (userId, slugs) =>
  Promise.all(slugs.map((slug) => {
    const until = new Date(Date.now() + SLUG_HOLD_DAYS * 24 * 60 * 60 * 1000);
    return prisma.slugHold.upsert({ where: { slug }, create: { slug, userId, until }, update: { userId, until } });
  }));

// 402: o painel mostra a mensagem como está.
export const assertActive = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !isActive(user)) throw httpError(402, "Seu período grátis ou assinatura acabou. Assine para editar seus cartões.");
  return user;
};

// Cartão de outro usuário responde 404, igual a um inexistente.
const findOwned = async (userId, id) => {
  const card = await cardRepository.findById(id);
  if (!card || card.userId !== userId) throw httpError(404, "Cartão não encontrado.");
  return card;
};

const assertSlugFree = async (userId, slug, exceptId) => {
  const other = await cardRepository.findBySlug(slug);
  if (other && other.id !== exceptId) throw httpError(409, "Esse endereço já está em uso. Escolha outro.");
  const hold = await prisma.slugHold.findUnique({ where: { slug } });
  if (hold && hold.userId !== userId && hold.until > new Date()) throw httpError(409, "Esse endereço já está em uso. Escolha outro.");
};

// A unique do banco cobre a corrida entre a checagem e o insert.
const uniqueSlug = (error) => {
  if (error?.code === "P2002") throw httpError(409, "Esse endereço já está em uso. Escolha outro.");
  throw error;
};

export const list = async (userId) => {
  const cards = await cardRepository.findAllByUser(userId);
  return cards.map((card) => new ListCardDto(card));
};

export const register = async (userId, dto) => {
  const template = templateService.findById(dto.template);
  if (!template) throw httpError(400, "Modelo não encontrado.");

  const user = await assertActive(userId);
  // Sem verificação, dava para girar contas novas e emendar trials de 3 dias para sempre.
  if (!user.emailVerifiedAt) throw httpError(403, "Confirme seu e-mail para criar cartões. O link está na sua caixa de entrada.");
  // ponytail: count + insert sem lock; dois POSTs simultâneos podem passar do limite por 1. Aceitável.
  if ((await cardRepository.countByUser(userId)) >= MAX_CARDS) {
    throw httpError(403, `Seu plano inclui até ${MAX_CARDS} cartões. Exclua um para criar outro.`);
  }
  await assertSlugFree(userId, dto.slug);

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
  const current = await findOwned(userId, id);
  await assertActive(userId);

  if (dto.slug !== undefined) await assertSlugFree(userId, dto.slug, id);

  const data = {};
  if (dto.slug !== undefined) data.slug = dto.slug;
  if (dto.config !== undefined) data.config = dto.config;

  const card = await cardRepository.saveCard(id, data).catch(uniqueSlug);
  if (card.slug !== current.slug) await holdSlugs(userId, [current.slug]);
  return new ListCardDto(card);
};

export const remove = async (userId, id) => {
  const card = await findOwned(userId, id);
  await cardRepository.deleteCard(id);
  await holdSlugs(userId, [card.slug]);
};

export const getPublicBySlug = async (slug) => {
  const card = await cardRepository.findBySlug(String(slug).toLowerCase());
  if (!card) throw httpError(404, "Cartão não encontrado.");
  if (card.disabledAt || !isOnline(card.user)) throw httpError(410, "Cartão indisponível.");
  return isActive(card.user) ? card.config : basicConfig(card.config);
};
