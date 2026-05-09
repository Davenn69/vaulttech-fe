export type CategoryModel = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  approvalRequired: boolean;
  approvalRole: string;
};
