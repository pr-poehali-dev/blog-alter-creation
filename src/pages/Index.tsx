import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/939b7a78-ca7f-47fb-87a7-d0d621a3d141';
const POSTS_URL = 'https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  post_type: string;
  category?: string;
  tags?: string[];
  published: boolean;
  views: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  likes_count?: number;
  comments_count?: number;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadPosts();
    loadStories();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch(`${POSTS_URL}?type=blog&limit=20`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    }
  };

  const loadStories = async () => {
    try {
      const response = await fetch(`${POSTS_URL}?type=story&limit=10`);
      const data = await response.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      action: isLogin ? 'login' : 'register',
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (!isLogin) {
      data.username = formData.get('username');
      data.full_name = formData.get('full_name');
    }

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        setShowAuthDialog(false);
      } else {
        alert(result.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Ошибка соединения');
    }
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('Войдите для создания поста');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const postData = {
      user_id: user.id,
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      post_type: formData.get('post_type') || 'blog',
      category: formData.get('category'),
      published: true,
    };

    try {
      const response = await fetch(POSTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert('Пост создан!');
        loadPosts();
        loadStories();
        setActiveSection('home');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ModernBlog
              </h1>
              <div className="hidden md:flex gap-6">
                {['home', 'blogs', 'authors', 'about'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`text-sm font-medium transition-colors ${
                      activeSection === section ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {section === 'home' && 'Главная'}
                    {section === 'blogs' && 'Блоги'}
                    {section === 'authors' && 'Авторы'}
                    {section === 'about' && 'О нас'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button
                    onClick={() => setActiveSection('create')}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <Icon name="PenSquare" size={16} className="mr-2" />
                    Создать
                  </Button>
                  <button onClick={() => setActiveSection('profile')}>
                    <Avatar className="w-10 h-10 border-2 border-primary">
                      <AvatarImage src={user.avatar_url || 'https://cdn.poehali.dev/projects/46d2a724-417f-4368-98d2-7fd3076df938/files/a679ccdf-4b2b-4e48-9ec0-9f73c4e35dfb.jpg'} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </>
              ) : (
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      Войти
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isLogin ? 'Вход' : 'Регистрация'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAuth} className="space-y-4">
                      {!isLogin && (
                        <>
                          <Input name="username" placeholder="Имя пользователя" required />
                          <Input name="full_name" placeholder="Полное имя" required />
                        </>
                      )}
                      <Input name="email" type="email" placeholder="Email" required />
                      <Input name="password" type="password" placeholder="Пароль" required />
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                      >
                        {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
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
                          <AvatarImage src={post.avatar_url || 'https://cdn.poehali.dev/projects/46d2a724-417f-4368-98d2-7fd3076df938/files/a679ccdf-4b2b-4e48-9ec0-9f73c4e35dfb.jpg'} />
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
            </div>
          </div>
        )}

        {activeSection === 'create' && user && (
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
        )}

        {activeSection === 'profile' && user && (
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
        )}

        {activeSection === 'blogs' && (
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
        )}

        {activeSection === 'about' && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                О платформе
              </h2>
              <div className="space-y-4 text-lg">
                <p>
                  ModernBlog — это современная платформа для создания и публикации контента.
                  Мы объединяем авторов и читателей со всего мира.
                </p>
                <p>
                  Делитесь своими идеями через блоги или короткие Stories в формате 9:16.
                  Находите вдохновение и общайтесь с единомышленниками.
                </p>
                <div className="flex gap-4 mt-8">
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Mail" size={16} className="mr-2" />
                    Связаться
                  </Button>
                  <Button variant="outline">
                    <Icon name="Users" size={16} className="mr-2" />
                    Сообщество
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'authors' && (
          <div>
            <h2 className="text-4xl font-bold mb-8">Авторы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(new Set(posts.map(p => p.user_id))).map((userId) => {
                const userPost = posts.find(p => p.user_id === userId);
                const userPosts = posts.filter(p => p.user_id === userId);
                return (
                  <Card key={userId} className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-4 border-4 border-primary">
                        <AvatarImage src={userPost?.avatar_url || 'https://cdn.poehali.dev/projects/46d2a724-417f-4368-98d2-7fd3076df938/files/a679ccdf-4b2b-4e48-9ec0-9f73c4e35dfb.jpg'} />
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
          </div>
        )}
      </main>

      <footer className="bg-card border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 ModernBlog. Все права защищены.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Условия</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Конфиденциальность</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Контакты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}