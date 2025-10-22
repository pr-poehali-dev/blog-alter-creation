import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          <Tabs defaultValue="blog" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blog">Блог</TabsTrigger>
              <TabsTrigger value="story">Story (9:16)</TabsTrigger>
            </TabsList>
            <TabsContent value="blog" className="space-y-4 mt-6">
              <input type="hidden" name="post_type" value="blog" />
              <Input name="title" placeholder="Заголовок" required />
              <Input name="excerpt" placeholder="Краткое описание" />
              <Input name="category" placeholder="Категория" />
              <Textarea name="content" placeholder="Содержание поста..." rows={10} required />
            </TabsContent>
            <TabsContent value="story" className="space-y-4 mt-6">
              <input type="hidden" name="post_type" value="story" />
              <Input name="title" placeholder="Заголовок Story" required />
              <Textarea name="content" placeholder="Текст для Story..." rows={6} required />
              <p className="text-sm text-muted-foreground">
                Story отображается в формате 9:16 на главной странице
              </p>
            </TabsContent>
          </Tabs>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
            Опубликовать
          </Button>
        </form>
      </Card>
    </div>
  );
}
