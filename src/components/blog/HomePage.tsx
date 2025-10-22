import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Post, User } from '@/lib/types';

interface HomePageProps {
  user: User | null;
  posts: Post[];
  stories: Post[];
  setActiveSection: (section: string) => void;
  setShowAuthDialog: (show: boolean) => void;
}

export default function HomePage({ user, posts, stories, setActiveSection, setShowAuthDialog }: HomePageProps) {
  return (
    <div className="space-y-12">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary p-12 text-white">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-5xl font-bold mb-4">Делись своими историями с миром</h2>
          <p className="text-xl opacity-90 mb-6">
            Создавай, публикуй и находи вдохновение в современной блог-платформе
          </p>
          <Button
            onClick={() => user ? setActiveSection('create') : setShowAuthDialog(true)}
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
          >
            Начать писать
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <img 
            src="https://cdn.poehali.dev/projects/46d2a724-417f-4368-98d2-7fd3076df938/files/70d946d2-2de1-4a12-8aca-a8ea15a03380.jpg" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {stories.length > 0 && (
        <div>
          <h3 className="text-3xl font-bold mb-6">Stories</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="flex-shrink-0 w-40 aspect-[9/16] overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                style={{
                  backgroundImage: story.cover_image_url
                    ? `url(${story.cover_image_url})`
                    : 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <CardContent className="h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-semibold text-sm line-clamp-2">{story.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-3xl font-bold mb-6">Последние посты</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">Пока нет постов</p>
            <p className="text-sm text-muted-foreground mb-6">Будьте первым, кто поделится своей историей!</p>
            <Button
              onClick={() => user ? setActiveSection('create') : setShowAuthDialog(true)}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Создать первый пост
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary to-secondary">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="FileText" size={48} className="text-white opacity-50" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.avatar_url} />
                    <AvatarFallback>{post.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{post.full_name || post.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h4>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {post.excerpt || post.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Heart" size={16} />
                    {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="MessageCircle" size={16} />
                    {post.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Eye" size={16} />
                    {post.views}
                  </span>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}