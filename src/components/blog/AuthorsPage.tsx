import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Post } from '@/lib/types';

interface AuthorsPageProps {
  posts: Post[];
}

export default function AuthorsPage({ posts }: AuthorsPageProps) {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">Авторы</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Users" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Пока нет авторов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(new Set(posts.map(p => p.user_id))).map((userId) => {
          const userPost = posts.find(p => p.user_id === userId);
          const userPosts = posts.filter(p => p.user_id === userId);
          return (
            <Card key={userId} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4 border-4 border-primary">
                  <AvatarImage src={userPost?.avatar_url} />
                  <AvatarFallback className="text-xl">{userPost?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-1">{userPost?.full_name}</h3>
                <p className="text-sm text-muted-foreground mb-4">@{userPost?.username}</p>
                <Badge className="mb-4">{userPosts.length} постов</Badge>
              </div>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}