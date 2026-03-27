export type UserStatus = "Hoạt động" | "Đã mời" | "Tạm khóa";
export type UserRole = "Thành viên" | "Moderator" | "Operator" | "Admin nội dung" | "Search ops" | "Super admin";

export type AdminUser = {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  workspace: string;
  note?: string;
};

export type UserFormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  workspace: string;
  password: string;
  confirmPassword: string;
  avatar: string;
  note: string;
};

export const avatarByUser = {
  "ngoc-minh": "/avatars/ngoc-minh.png",
  "dieu-an": "/avatars/dieu-an.png",
  "phap-bao": "/avatars/phap-bao.png",
  "son-nhien": "/avatars/qa-operator.png",
  "thanh-tinh": "/avatars/thanh-tinh.png",
} as const;

export const initialUsers: AdminUser[] = [
  {
    id: "1",
    publicId: "usr_ngoc_minh",
    firstName: "Ngọc",
    lastName: "Minh",
    username: "ngoc.minh",
    email: "ngoc.minh@pmtl.vn",
    phoneNumber: "+84901234001",
    role: "Admin nội dung",
    status: "Hoạt động",
    avatar: avatarByUser["ngoc-minh"],
    workspace: "Điều phối nội dung",
    note: "Owner lane bài viết và hướng dẫn.",
  },
  {
    id: "2",
    publicId: "usr_dieu_an",
    firstName: "Diệu",
    lastName: "An",
    username: "dieu.an",
    email: "dieu.an@pmtl.vn",
    phoneNumber: "+84901234002",
    role: "Moderator",
    status: "Hoạt động",
    avatar: avatarByUser["dieu-an"],
    workspace: "Kiểm duyệt cộng đồng",
    note: "Theo dõi báo cáo và bình luận.",
  },
  {
    id: "3",
    publicId: "usr_phap_bao",
    firstName: "Pháp",
    lastName: "Bảo",
    username: "phap.bao",
    email: "phap.bao@pmtl.vn",
    phoneNumber: "+84901234003",
    role: "Search ops",
    status: "Hoạt động",
    avatar: avatarByUser["phap-bao"],
    workspace: "Hệ thống",
    note: "Phụ trách search, audit và health.",
  },
  {
    id: "4",
    publicId: "usr_son_nhien",
    firstName: "Sơn",
    lastName: "Nhiên",
    username: "admin",
    email: "admin@pmtl.local",
    phoneNumber: "+84901234000",
    role: "Super admin",
    status: "Hoạt động",
    avatar: avatarByUser["son-nhien"],
    workspace: "Vận hành PMTL",
    note: "Tài khoản nội bộ quản trị cao nhất.",
  },
  {
    id: "5",
    publicId: "usr_thanh_tinh",
    firstName: "Thanh",
    lastName: "Tịnh",
    username: "thanh.tinh",
    email: "thanh.tinh@pmtl.vn",
    phoneNumber: "+84901234005",
    role: "Operator",
    status: "Đã mời",
    avatar: avatarByUser["thanh-tinh"],
    workspace: "Hỗ trợ phát nguyện",
    note: "Đang chờ xác nhận thư mời.",
  },
];

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Thành viên", value: "Thành viên" },
  { label: "Moderator", value: "Moderator" },
  { label: "Operator", value: "Operator" },
  { label: "Admin nội dung", value: "Admin nội dung" },
  { label: "Search ops", value: "Search ops" },
  { label: "Super admin", value: "Super admin" },
];

export const statusOptions: { label: string; value: UserStatus }[] = [
  { label: "Hoạt động", value: "Hoạt động" },
  { label: "Đã mời", value: "Đã mời" },
  { label: "Tạm khóa", value: "Tạm khóa" },
];

export function getDefaultFormState(user?: AdminUser | null): UserFormState {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      role: "Operator",
      status: "Hoạt động",
      workspace: "Vận hành PMTL",
      password: "",
      confirmPassword: "",
      avatar: avatarByUser["son-nhien"],
      note: "",
    };
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    workspace: user.workspace,
    password: "",
    confirmPassword: "",
    avatar: user.avatar,
    note: user.note ?? "",
  };
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function userToName(user: AdminUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function statusVariant(status: UserStatus): "default" | "secondary" | "outline" {
  if (status === "Hoạt động") return "secondary";
  if (status === "Đã mời") return "outline";
  return "default";
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
