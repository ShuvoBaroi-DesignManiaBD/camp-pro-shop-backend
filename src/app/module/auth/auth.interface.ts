export type TSignInUser = {
  email: string;
  password: string;
};

export type TJwtPayload = {
  email: string;
  id: string;
  role: string;
};

