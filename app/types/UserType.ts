export interface UserType {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name?: string;
  email: string;
  image?: string;
  companyId?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string;
  companyId?: string;
} 