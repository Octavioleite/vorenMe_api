import prisma from "../lib/prisma.js";

export const registerUser = async (data) => {
  return await prisma.user.create({ data });
};

export const findByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};
