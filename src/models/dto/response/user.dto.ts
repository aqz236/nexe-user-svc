/**
 * 用户管理相关的响应 DTO
 */

export interface UserProfileResponseDto {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponseDto {
  users: UserProfileResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
