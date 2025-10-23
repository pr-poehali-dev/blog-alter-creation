import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { User } from '@/lib/types';

interface CreatePostProps {
  user: User | null;
  handleCreatePost: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CreatePost({ user, handleCreatePost }: CreatePostProps) {
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-6">Создать пост</h2>
        <form onSubmit={handleCreatePost} className="space-y-6">
          <div className="space-y-4">
            <input type="hidden" name="post_type" value="blog" />
            <Input name="title" placeholder="Заголовок" required />
            <Input name="excerpt" placeholder="Краткое описание" />
            <Input name="category" placeholder="Категория" />
            <Textarea name="content" placeholder="Содержание поста..." rows={10} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
            Опубликовать
          </Button>
        </form>
      </Card>
    </div>
  );
}