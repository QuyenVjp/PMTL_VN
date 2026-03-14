import type { Payload } from "payload";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  type AuthSession,
  type AuthUser,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
  type UserRole,
} from "@pmtl/shared";

type RawUser = {
  id: number | string;
  email: string;
  displayName?: string | null;
  bio?: string | null;
  role?: UserRole | null;
  status?: "active" | "pending" | "suspended" | null;
  avatar?:
    | null
    | number
    | string
    | {
        id?: number | string | null;
        url?: string | null;
      };
  createdAt: string;
  updatedAt: string;
};

export class UserAuthError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function canManageUsers(role?: string): boolean {
  return role === "super-admin" || role === "admin";
}

export function buildResetPasswordURL(token: string): string {
  const baseUrl =
    process.env.AUTH_RESET_PASSWORD_URL ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`;

  return new URL(`?token=${encodeURIComponent(token)}`, baseUrl).toString();
}

export function normalizeUserProfileInput<T extends { bio?: string | null; displayName?: string | null }>(
  input: T,
): T {
  return {
    ...input,
    bio: input.bio?.trim() ?? "",
    displayName: input.displayName?.trim() ?? input.displayName,
  };
}

function mapAvatar(avatar: RawUser["avatar"]): { avatarId: string | null; avatarUrl: string | null } {
  if (!avatar || typeof avatar === "number" || typeof avatar === "string") {
    return {
      avatarId: avatar ? String(avatar) : null,
      avatarUrl: null,
    };
  }

  return {
    avatarId: avatar.id ? String(avatar.id) : null,
    avatarUrl: avatar.url ?? null,
  };
}

export function mapUserToAuthUser(user: RawUser): AuthUser {
  const avatar = mapAvatar(user.avatar);

  return {
    id: String(user.id),
    email: user.email,
    displayName: user.displayName ?? user.email,
    bio: user.bio ?? "",
    role: user.role ?? "member",
    status: user.status ?? "active",
    avatarId: avatar.avatarId,
    avatarUrl: avatar.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function resolveRegistrationRole(payload: Payload): Promise<UserRole> {
  const totalUsers = await payload.count({
    collection: "users",
    overrideAccess: true,
  });

  return totalUsers.totalDocs === 0 ? "super-admin" : "member";
}

function assertUserCanAuthenticate(user: RawUser | null | undefined): asserts user is RawUser {
  if (!user) {
    throw new UserAuthError("AUTH_INVALID_CREDENTIALS", "Email hoac mat khau khong dung.", 401);
  }

  if (user.status !== "active") {
    throw new UserAuthError("AUTH_USER_INACTIVE", "Tai khoan hien khong the dang nhap.", 403);
  }
}

async function findUserByEmail(payload: Payload, email: string): Promise<RawUser | null> {
  const result = await payload.find({
    collection: "users",
    overrideAccess: true,
    limit: 1,
    where: {
      email: {
        equals: email.toLowerCase(),
      },
    },
  });

  return (result.docs[0] as RawUser | undefined) ?? null;
}

export async function registerUser(payload: Payload, input: RegisterInput): Promise<AuthSession> {
  const parsedInput = registerSchema.parse(input);
  const existingUser = await findUserByEmail(payload, parsedInput.email);

  if (existingUser) {
    throw new UserAuthError("AUTH_EMAIL_IN_USE", "Email nay da duoc su dung.", 409);
  }

  const role = await resolveRegistrationRole(payload);
  const createdUser = (await payload.create({
    collection: "users",
    data: {
      email: parsedInput.email.toLowerCase(),
      password: parsedInput.password,
      displayName: parsedInput.displayName,
      bio: "",
      role,
      status: "active",
    },
    overrideAccess: true,
  })) as RawUser;

  const loginResult = await payload.login({
    collection: "users",
    data: {
      email: parsedInput.email.toLowerCase(),
      password: parsedInput.password,
    },
    overrideAccess: true,
  });

  if (!loginResult.token) {
    throw new UserAuthError("AUTH_UNKNOWN", "Khong tao duoc session sau khi dang ky.", 500);
  }

  return {
    token: loginResult.token,
    exp: loginResult.exp ?? null,
    user: mapUserToAuthUser((loginResult.user as RawUser | undefined) ?? createdUser),
  };
}

export async function loginUser(payload: Payload, input: LoginInput): Promise<AuthSession> {
  const parsedInput = loginSchema.parse(input);
  const foundUser = await findUserByEmail(payload, parsedInput.email);
  assertUserCanAuthenticate(foundUser);

  const loginResult = await payload.login({
    collection: "users",
    data: {
      email: parsedInput.email.toLowerCase(),
      password: parsedInput.password,
    },
    overrideAccess: true,
  });

  if (!loginResult.token || !loginResult.user) {
    throw new UserAuthError("AUTH_INVALID_CREDENTIALS", "Email hoac mat khau khong dung.", 401);
  }

  return {
    token: loginResult.token,
    exp: loginResult.exp ?? null,
    user: mapUserToAuthUser(loginResult.user as RawUser),
  };
}

export async function getCurrentSession(payload: Payload, headers: Headers): Promise<AuthSession | null> {
  const authResult = await payload.auth({
    headers,
  });

  if (!authResult.user) {
    return null;
  }

  const tokenHeader = headers.get("Authorization");
  const token = tokenHeader?.replace(/^Bearer\s+/i, "").replace(/^JWT\s+/i, "") ?? "";

  return {
    token,
    exp: null,
    user: mapUserToAuthUser(authResult.user as RawUser),
  };
}

export async function requestPasswordReset(
  payload: Payload,
  input: ForgotPasswordInput,
  options?: {
    disableEmail?: boolean;
  },
): Promise<{ message: string; resetToken?: string | null }> {
  const parsedInput = forgotPasswordSchema.parse(input);
  const resetToken = await payload.forgotPassword({
    collection: "users",
    data: {
      email: parsedInput.email.toLowerCase(),
    },
    ...(options?.disableEmail !== undefined ? { disableEmail: options.disableEmail } : {}),
    overrideAccess: true,
  });

  return {
    message: "Neu email ton tai, huong dan dat lai mat khau da duoc gui.",
    ...(resetToken ? { resetToken } : {}),
  };
}

export async function resetUserPassword(
  payload: Payload,
  input: ResetPasswordInput,
): Promise<AuthSession> {
  const parsedInput = resetPasswordSchema.parse(input);
  const resetResult = await payload.resetPassword({
    collection: "users",
    data: {
      token: parsedInput.token,
      password: parsedInput.password,
    },
    overrideAccess: true,
  });

  if (!resetResult.token || !resetResult.user) {
    throw new UserAuthError(
      "AUTH_RESET_TOKEN_INVALID",
      "Token dat lai mat khau khong hop le hoac da het han.",
      400,
    );
  }

  return {
    token: resetResult.token,
    exp: null,
    user: mapUserToAuthUser(resetResult.user as RawUser),
  };
}

export async function updateOwnProfile(
  payload: Payload,
  userId: string,
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const parsedInput = updateProfileSchema.parse(input);
  const updatedUser = (await payload.update({
    collection: "users",
    id: Number(userId),
    data: normalizeUserProfileInput(parsedInput),
    overrideAccess: true,
  })) as unknown as RawUser;

  return mapUserToAuthUser(updatedUser);
}
