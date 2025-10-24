import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User | null;
  unreadCount?: number;
}

export default function MobileBottomNav({
  activeSection,
  setActiveSection,
  user,
  unreadCount = 0,
}: MobileBottomNavProps) {
  const navItems = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'blogs', icon: 'BookOpen', label: 'Блоги' },
    { id: 'reels', icon: 'Video', label: 'Reels' },
    { id: 'messages', icon: 'MessageCircle', label: 'Чаты', badge: unreadCount },
    { id: 'profile', icon: 'User', label: 'Профиль', isProfile: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg touch-manipulation tap-highlight-transparent">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all select-none touch-manipulation tap-highlight-transparent ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground active:scale-95'
              }`}
            >
              {item.isProfile && user ? (
                <Avatar className={`w-7 h-7 ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs">{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="relative">
                  <Icon name={item.icon as any} size={24} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}