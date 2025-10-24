import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';
import MusicDialog from '@/components/music/MusicDialog';

interface NavbarProps {
  user: User | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  handleAuth: (e: React.FormEvent<HTMLFormElement>) => void;
  unreadCount?: number;
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
  unreadCount = 0,
}: NavbarProps) {
  const [showMusicDialog, setShowMusicDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vega Blog
            </h1>
            <div className="hidden md:flex gap-6">
              {['home', 'blogs', 'reels', 'authors', 'messages', 'about']
                .filter(section => {
                  if (!user && (section === 'reels' || section === 'messages')) return false;
                  return true;
                })
                .map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm font-medium transition-colors relative ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'blogs' && 'Блоги'}
                  {section === 'reels' && 'Reels'}
                  {section === 'authors' && 'Авторы'}
                  {section === 'messages' && (
                    <>
                      Сообщения
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                  {section === 'about' && 'О нас'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </Button>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMusicDialog(true)}
                  className="hover:text-primary transition-colors"
                  title="Моя музыка"
                >
                  <Icon name="Music" size={20} />
                </Button>
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

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
            {['home', 'blogs', 'reels', 'authors', 'messages', 'about']
              .filter(section => {
                if (!user && (section === 'reels' || section === 'messages')) return false;
                return true;
              })
              .map((section) => (
              <button
                key={section}
                onClick={() => {
                  setActiveSection(section);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${
                  activeSection === section
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <span>
                  {section === 'home' && '🏠 Главная'}
                  {section === 'blogs' && '📝 Блоги'}
                  {section === 'reels' && '🎬 Reels'}
                  {section === 'authors' && '👥 Авторы'}
                  {section === 'messages' && '💬 Сообщения'}
                  {section === 'about' && 'ℹ️ О нас'}
                </span>
                {section === 'messages' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            ))}
            {user && (
              <button
                onClick={() => {
                  setActiveSection('create');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-primary to-secondary text-white flex items-center gap-2"
              >
                <Icon name="PenSquare" size={16} />
                Создать пост
              </button>
            )}
          </div>
        )}
      </div>
      <MusicDialog open={showMusicDialog} onOpenChange={setShowMusicDialog} user={user} />
    </nav>

    {mobileMenuOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}
    </>
  );
}