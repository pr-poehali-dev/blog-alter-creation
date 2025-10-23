import Icon from '@/components/ui/icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon name={icon as any} size={48} className="mx-auto mb-4 opacity-20" />
      <p>{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
