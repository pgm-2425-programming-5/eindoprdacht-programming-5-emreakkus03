export type RichTextNode = {
  type: string;
  children: Array<{ text?: string; type?: string; children?: any[] }>;
};

export type Comment = {
  id: number;
  documentId: string;
  message: string;
  dateAdded: string;
  users_permissions_user: {
    id: number;
    username: string;
    documentId: string;
  };
  comments?: Comment[]; 
  children?: Comment[];
};

export type Post = {
    id: number;
    documentId: string;
    image?: {
        url: string;
        alternativeText?: string; 
    };
    description: string;
    ingredients: string;
    steps: string;
    category?: {
        documentId: string | number | readonly string[] | undefined;
        title: string;
    };
    difficulty: string;
    totalTime: number;
    servings: number;
    dateAdded: string;
    title: string;
    amountLikes: number;
    comments?: Comment[];
    user?: {                 
        documentId: string;
        username: string;
    };
};
