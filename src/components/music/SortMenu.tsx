import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'artist-asc' | 'artist-desc';

interface SortMenuProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function SortMenu({ currentSort, onSortChange }: SortMenuProps) {
  const getSortLabel = (sort: SortOption): string => {
    const labels: Record<SortOption, string> = {
      'date-desc': 'Новые первые',
      'date-asc': 'Старые первые',
      'title-asc': 'Название (А-Я)',
      'title-desc': 'Название (Я-А)',
      'artist-asc': 'Исполнитель (А-Я)',
      'artist-desc': 'Исполнитель (Я-А)',
    };
    return labels[sort];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Icon name="ArrowUpDown" size={16} className="mr-2" />
          {getSortLabel(currentSort)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Сортировка</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
          <Icon name="CalendarArrowDown" size={14} className="mr-2" />
          Новые первые
          {currentSort === 'date-desc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
          <Icon name="CalendarArrowUp" size={14} className="mr-2" />
          Старые первые
          {currentSort === 'date-asc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onSortChange('title-asc')}>
          <Icon name="ArrowUpAZ" size={14} className="mr-2" />
          Название (А-Я)
          {currentSort === 'title-asc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('title-desc')}>
          <Icon name="ArrowDownZA" size={14} className="mr-2" />
          Название (Я-А)
          {currentSort === 'title-desc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onSortChange('artist-asc')}>
          <Icon name="UserRoundSearch" size={14} className="mr-2" />
          Исполнитель (А-Я)
          {currentSort === 'artist-asc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('artist-desc')}>
          <Icon name="UserRoundSearch" size={14} className="mr-2" />
          Исполнитель (Я-А)
          {currentSort === 'artist-desc' && <Icon name="Check" size={14} className="ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
