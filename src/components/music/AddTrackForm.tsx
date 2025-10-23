import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface AddTrackFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function AddTrackForm({ onSubmit, onCancel }: AddTrackFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-muted p-4 rounded-lg space-y-3">
      <Input name="title" placeholder="Название трека" required />
      <Input name="artist" placeholder="Исполнитель" required />
      <div>
        <label className="text-sm font-medium mb-2 block">Аудиофайл</label>
        <Input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'audioUrl';
                input.value = reader.result as string;
                e.target.form?.appendChild(input);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="cursor-pointer"
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          <Icon name="Check" size={16} className="mr-2" />
          Сохранить
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
