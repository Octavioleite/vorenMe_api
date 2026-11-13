import prisma from "../lib/prisma.js";

export const registerCard = async (data) => {
  return await prisma.card.create({ data });
};

export const findAllByUser = async (userId) => {
  return await prisma.card.findMany({ where: { userId }, orderBy: { createAt: "asc" } });
};

export const findById = async (id) => {
  return await prisma.card.findUnique({ where: { id } });
};

export const findBySlug = async (slug) => {
  return await prisma.card.findUnique({ where: { slug }, include: { user: { select: { createAt: true, paidUntil: true, active: true, emailVerifiedAt: true } } } });
};

export const countByUser = async (userId) => {
  return await prisma.card.count({ where: { userId } });
};

export const saveCard = async (id, data) => {
  return await prisma.card.update({ where: { id }, data });
};

export const deleteCard = async (id) => {
  return await prisma.card.delete({ where: { id } });
};
