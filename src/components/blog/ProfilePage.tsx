import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User, Post } from '@/lib/types';

interface ProfilePageProps {
  user: User | null;
  posts: Post[];
  handleLogout: () => void;
}

export default function ProfilePage({ user, posts, handleLogout }: ProfilePageProps) {
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage src={user.avatar_url || 'https://cdn.poehali.dev/projects/46d2a724-417f-4368-98d2-7fd3076df938/files/a679ccdf-4b2b-4e48-9ec0-9f73c4e35dfb.jpg'} />
            <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{user.full_name}</h2>
            <p className="text-muted-foreground mb-4">@{user.username}</p>
            <p className="text-sm mb-4">{user.bio || 'Нет описания'}</p>
            <Button onClick={handleLogout} variant="outline">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">Мои посты</h3>
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
      </Card>
    </div>
  );
}
