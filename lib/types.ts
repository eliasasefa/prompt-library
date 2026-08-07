export type Prompt = {
  id: number;
  title: string;
  content: string;
  is_public: boolean;
  category_id: number | null;
  category: string | null;
  author: string | null;
  author_image: string | null;
  own: boolean;
  created_at: string;
  updated_at: string;
  votes_count: number;
  user_voted: boolean; 
};

export type Category = {
  id: number;
  name: string;
  prompt_count: number;
};