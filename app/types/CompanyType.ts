export interface CompanyType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  name: string;
}

export interface UpdateCompanyInput {
  name?: string;
} 