import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';

interface NavbarProps {
  user: User | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  handleAuth: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function Navbar({
  user,
  activeSection,
  setActiveSection,
  showAuthDialog,
  setShowAuthDialog,
  isLogin,
  setIsLogin,
  handleAuth,
}: NavbarProps) {
  return (
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
                    <AvatarImage src={user.avatar_url} />
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
  );
}