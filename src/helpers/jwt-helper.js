import jwt from "jsonwebtoken";

export const sign = (payload) =>
  jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 2000 });
export const verify = (token) => jwt.verify(token, process.env.SECRET_KEY);
