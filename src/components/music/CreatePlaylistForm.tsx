import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface CreatePlaylistFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function CreatePlaylistForm({ onSubmit, onCancel }: CreatePlaylistFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-muted p-4 rounded-lg space-y-3">
      <Input name="name" placeholder="Название плейлиста" required />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          <Icon name="Check" size={16} className="mr-2" />
          Создать
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
