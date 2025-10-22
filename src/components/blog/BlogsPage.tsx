import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Post } from '@/lib/types';

interface BlogsPageProps {
  posts: Post[];
}

export default function BlogsPage({ posts }: BlogsPageProps) {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">Все блоги</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary to-secondary">
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="FileText" size={48} className="text-white opacity-50" />
              </div>
            </div>
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-muted-foreground text-sm line-clamp-3">
                {post.excerpt || post.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
