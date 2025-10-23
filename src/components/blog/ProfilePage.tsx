import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { User, Post, AUTH_URL } from '@/lib/types';

interface ProfilePageProps {
  user: User | null;
  posts: Post[];
  handleLogout: () => void;
  onProfileUpdate: (user: User) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
}

export default function ProfilePage({ user, posts, handleLogout, onProfileUpdate, soundEnabled, onSoundToggle }: ProfilePageProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  });

  if (!user) return null;

  const handleGenerateAvatar = async () => {
    const prompt = window.prompt('Опишите желаемую аватарку (например: "профессиональное фото космонавта", "абстрактный геометрический портрет"):');
    if (!prompt) return;

    setIsGeneratingAvatar(true);
    try {
      const response = await fetch('https://functions.poehali.dev/41024847-9bfe-411d-b67b-40fb50891f8c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.url) {
        setEditForm({ ...editForm, avatar_url: data.url });
      } else {
        alert('Ошибка генерации изображения');
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      alert('Ошибка соединения');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(AUTH_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          full_name: editForm.full_name,
          bio: editForm.bio,
          avatar_url: editForm.avatar_url,
        }),
      });

      const result = await response.json();
      if (response.ok && result.user) {
        onProfileUpdate(result.user);
        setShowEditDialog(false);
        alert('Профиль обновлён!');
      } else {
        alert(result.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Ошибка соединения');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{user.full_name}</h2>
            <p className="text-muted-foreground mb-4">@{user.username}</p>
            <p className="text-sm mb-4">{user.bio || 'Нет описания'}</p>
            <div className="flex gap-2">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Редактировать профиль</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Полное имя</label>
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Ваше имя"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">О себе</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Расскажите о себе..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Аватарка</label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditForm({ ...editForm, avatar_url: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="cursor-pointer"
                        />
                        <Button
                          type="button"
                          onClick={handleGenerateAvatar}
                          disabled={isGeneratingAvatar}
                          variant="outline"
                          className="shrink-0"
                          title="Сгенерировать с помощью ИИ"
                        >
                          <Icon name="Sparkles" size={16} />
                        </Button>
                      </div>
                      {editForm.avatar_url && (
                        <div className="mt-3">
                          <Avatar className="w-20 h-20 border-2 border-primary">
                            <AvatarImage src={editForm.avatar_url} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <label className="text-sm font-medium block mb-1">Звук уведомлений</label>
                        <p className="text-xs text-muted-foreground">Воспроизводить звук при новых сообщениях</p>
                      </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={onSoundToggle}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                      Сохранить изменения
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={handleLogout} variant="outline">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">Мои посты</h3>
        {posts.filter(p => p.user_id === user.id).length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">У вас пока нет постов</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.filter(p => p.user_id === user.id).map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <Badge>{post.post_type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}