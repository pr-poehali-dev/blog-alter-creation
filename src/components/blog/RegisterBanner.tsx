import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RegisterBannerProps {
  onRegisterClick: () => void;
}

export default function RegisterBanner({ onRegisterClick }: RegisterBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl -ml-24 -mb-24" />
      
      <div className="relative p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-4 mb-6">
            <div className={`relative transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                <Icon name="Video" size={32} className="text-primary" />
              </div>
            </div>
            <div className={`relative transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                <Icon name="MessageCircle" size={32} className="text-secondary" />
              </div>
            </div>
            <div className={`relative transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                <Icon name="Music" size={32} className="text-primary" />
              </div>
            </div>
          </div>

          <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Откройте премиум возможности!
          </h2>
          
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Зарегистрируйтесь бесплатно и получите доступ к эксклюзивным функциям
          </p>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Icon name="Video" size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Reels</h3>
                <p className="text-xs text-muted-foreground">Вертикальные видео</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-secondary/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                <Icon name="MessageCircle" size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Сообщения</h3>
                <p className="text-xs text-muted-foreground">Личные чаты</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Icon name="Music" size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Музыка</h3>
                <p className="text-xs text-muted-foreground">Треки и плейлисты</p>
              </div>
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-700 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}>
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 animate-[pulse-glow_2s_ease-in-out_infinite]"
              style={{
                animation: isVisible ? 'pulse-glow 2s ease-in-out infinite' : 'none'
              }}
            >
              <Icon name="Sparkles" size={20} className="mr-2" />
              Начать бесплатно
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Check" size={16} className="text-green-500" />
              <span>Без оплаты • Навсегда</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}