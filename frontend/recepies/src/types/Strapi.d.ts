export interface StrapiUser {
  id: number;
  username: string;
  email: string;
}

export interface Comment {
  id: number;
  message: string;
  users_permissions_user: {
    id: number;
    username: string;
  };
    children?: Comment[];
}
