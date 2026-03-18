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

import { ensurePublicId } from "@/services/public-id.service";

type RawUser = {
  id: number | string;
  publicId?: string | null;
  email: string;
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
  dharmaName?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  isBlocked?: boolean | null;
  lastLoginAt?: string | null;
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

export function assertCanManageUser(role?: string): void {
  if (!canManageUsers(role)) {
    throw new UserAuthError("AUTH_FORBIDDEN", "Bạn không có quyền quản lý người dùng.", 403);
  }
}

function isInvalidCredentialError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeStatus = "status" in error ? (error as { status?: unknown }).status : undefined;
  if (maybeStatus === 401) {
    return true;
  }

  return /email or password provided is incorrect/i.test(error.message);
}

export function buildResetPasswordURL(token: string): string {
  const baseUrl =
    process.env.AUTH_RESET_PASSWORD_URL ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`;

  return new URL(`?token=${encodeURIComponent(token)}`, baseUrl).toString();
}

function normalizePhone(value?: string | null): string | undefined {
  const nextValue = value?.replace(/\s+/g, " ").trim();

  return nextValue || undefined;
}

function normalizeUsername(value?: string | null): string | undefined {
  const nextValue = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return nextValue || undefined;
}

function normalizeAvatarInput(value?: string | number | null): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  throw new UserAuthError("AUTH_UNKNOWN", "Avatar id khong hop le.", 400);
}

export function normalizeUserProfileInput<
  T extends { bio?: string | null; fullName?: string | null; username?: string | null; phone?: string | null },
>(
  input: T,
): T {
  return {
    ...input,
    bio: input.bio?.trim() ?? "",
    fullName: input.fullName?.trim() ?? input.fullName,
    username: normalizeUsername(input.username),
    phone: normalizePhone(input.phone),
  };
}

export function ensureUserProfileDefaults<T extends { publicId?: string | null | undefined; role?: UserRole | null | undefined }>(
  input: T,
): T {
  return ensurePublicId(
    {
      ...input,
      role: input.role ?? "member",
    },
    "usr",
  );
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
    displayName: user.fullName ?? user.email,
    bio: user.bio ?? "",
    role: user.role ?? "member",
    status: user.isBlocked ? "suspended" : "active",
    avatarId: avatar.avatarId,
    avatarUrl: avatar.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapUserToPublicDTO(user: RawUser) {
  return {
    publicId: user.publicId ?? null,
    email: user.email,
    fullName: user.fullName ?? user.email,
    username: user.username ?? null,
    bio: user.bio ?? "",
    dharmaName: user.dharmaName ?? null,
    phone: user.phone ?? null,
    role: user.role ?? "member",
    isBlocked: Boolean(user.isBlocked),
    lastLoginAt: user.lastLoginAt ?? null,
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

  if (user.isBlocked) {
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

export async function createUserProfile(
  payload: Payload,
  input: RegisterInput & { role?: UserRole; isBlocked?: boolean },
): Promise<RawUser> {
  const normalizedInput = ensureUserProfileDefaults(
    normalizeUserProfileInput({
      fullName: input.displayName,
      role: input.role ?? "member",
      isBlocked: input.isBlocked ?? false,
    }),
  );

  return (await payload.create({
    collection: "users",
    data: {
      email: input.email.toLowerCase(),
      password: input.password,
      ...normalizedInput,
      bio: "",
    },
    overrideAccess: true,
  } as never)) as RawUser;
}

export async function updateLastLoginAt(payload: Payload, userId: string | number): Promise<void> {
  await payload.update({
    collection: "users",
    id: userId,
    data: {
      lastLoginAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });
}

export async function registerUser(payload: Payload, input: RegisterInput): Promise<AuthSession> {
  const parsedInput = registerSchema.parse(input);
  const existingUser = await findUserByEmail(payload, parsedInput.email);

  if (existingUser) {
    throw new UserAuthError("AUTH_EMAIL_IN_USE", "Email nay da duoc su dung.", 409);
  }

  const role = await resolveRegistrationRole(payload);
  const createdUser = await createUserProfile(payload, {
    ...parsedInput,
    role,
    isBlocked: false,
  });

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

  await updateLastLoginAt(payload, (loginResult.user as RawUser | undefined)?.id ?? createdUser.id);

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

  let loginResult;

  try {
    loginResult = await payload.login({
      collection: "users",
      data: {
        email: parsedInput.email.toLowerCase(),
        password: parsedInput.password,
      },
      overrideAccess: true,
    });
  } catch (error) {
    if (isInvalidCredentialError(error)) {
      throw new UserAuthError("AUTH_INVALID_CREDENTIALS", "Email hoac mat khau khong dung.", 401);
    }

    throw error;
  }

  if (!loginResult.token || !loginResult.user) {
    throw new UserAuthError("AUTH_INVALID_CREDENTIALS", "Email hoac mat khau khong dung.", 401);
  }

  await updateLastLoginAt(payload, (loginResult.user as RawUser).id);

  return {
    token: loginResult.token,
    exp: loginResult.exp ?? null,
    user: mapUserToAuthUser(loginResult.user as RawUser),
  };
}

export async function getCurrentSession(payload: Payload, headers: Headers): Promise<AuthSession | null> {
  const authResult = await payload.auth({
    headers,
    canSetHeaders: false,
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
  const fullName = parsedInput.displayName ?? parsedInput.fullName;
  const nextProfile = normalizeUserProfileInput({
    ...(fullName !== undefined ? { fullName } : {}),
    ...(parsedInput.bio !== undefined ? { bio: parsedInput.bio } : {}),
    ...(parsedInput.phone !== undefined && parsedInput.phone !== null ? { phone: parsedInput.phone } : {}),
  });
  const updateData: {
    fullName?: string;
    bio?: string;
    phone?: string;
    dharmaName?: string | null;
    avatar?: number | null;
  } = {
    ...(nextProfile.fullName ? { fullName: nextProfile.fullName } : {}),
    ...(nextProfile.bio !== undefined ? { bio: nextProfile.bio } : {}),
    ...(nextProfile.phone ? { phone: nextProfile.phone } : {}),
  };

  if (parsedInput.phone === null) {
    updateData.phone = "";
  }

  if (parsedInput.dharmaName !== undefined) {
    updateData.dharmaName = parsedInput.dharmaName?.trim() || null;
  }

  if (parsedInput.avatar !== undefined) {
    const normalizedAvatar = normalizeAvatarInput(parsedInput.avatar);
    if (normalizedAvatar !== undefined) {
      updateData.avatar = normalizedAvatar;
    }
  }

  const updatedUser = (await payload.update({
    collection: "users",
    id: Number(userId),
    data: updateData,
    overrideAccess: true,
  })) as unknown as RawUser;

  return mapUserToAuthUser(updatedUser);
}
