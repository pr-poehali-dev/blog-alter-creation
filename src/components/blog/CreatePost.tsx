import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';

interface CreatePostProps {
  user: User | null;
  handleCreatePost: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CreatePost({ user, handleCreatePost }: CreatePostProps) {
  const [coverImage, setCoverImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user) return null;

  const handleGenerateImage = async () => {
    const prompt = window.prompt('Опишите изображение для обложки поста:');
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/41024847-9bfe-411d-b67b-40fb50891f8c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.url) {
        setCoverImage(data.url);
      } else {
        alert('Ошибка генерации изображения');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Ошибка соединения');
    } finally {
      setIsGenerating(false);
    }
  };

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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Обложка поста (необязательно)</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCoverImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  variant="outline"
                  className="shrink-0"
                  title="Сгенерировать с помощью ИИ"
                >
                  {isGenerating ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Sparkles" size={16} />
                  )}
                </Button>
              </div>
              <input type="hidden" name="cover_image_url" value={coverImage} />
              {coverImage && (
                <div className="mt-3">
                  <img src={coverImage} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
            Опубликовать
          </Button>
        </form>
      </Card>
    </div>
  );
}