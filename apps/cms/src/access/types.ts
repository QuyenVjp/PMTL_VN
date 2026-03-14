export type RequestUser = {
  id?: string | number;
  role?: unknown;
};

export type AccessArgs = {
  req: {
    user?: RequestUser | Record<string, unknown> | null;
  };
};
