import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';

interface CreateStoryDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStoryDialog({ user, open, onClose, onSuccess }: CreateStoryDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateImage = async () => {
    const prompt = window.prompt('Опишите изображение для вашей истории:');
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
        setImageUrl(data.url);
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

  const handleSubmit = async () => {
    if (!user || !imageUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_story',
          user_id: user.id,
          image_url: imageUrl
        })
      });

      if (response.ok) {
        setImageUrl('');
        onClose();
        onSuccess();
      } else {
        alert('Ошибка создания истории');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Ошибка соединения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Изображение для Story</label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImageUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="cursor-pointer"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateImage}
                disabled={isGenerating}
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
          </div>

          {imageUrl && (
            <div className="aspect-[9/16] max-h-[400px] rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!imageUrl || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Публикация...' : 'Опубликовать'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}