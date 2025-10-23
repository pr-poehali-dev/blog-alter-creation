import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          О Vega Blog
        </h2>
        <div className="space-y-4 text-lg">
          <p>
            Vega Blog — это современная платформа для создания и публикации контента.
            Мы объединяем авторов и читателей со всего мира.
          </p>
          <p>
            Делитесь своими идеями через блоги.
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
  );
}