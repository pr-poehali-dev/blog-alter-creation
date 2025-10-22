export default function Footer() {
  return (
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
  );
}
