import { useState, useEffect } from 'react';
import Navbar from '@/components/blog/Navbar';
import HomePage from '@/components/blog/HomePage';
import CreatePost from '@/components/blog/CreatePost';
import ProfilePage from '@/components/blog/ProfilePage';
import BlogsPage from '@/components/blog/BlogsPage';
import AuthorsPage from '@/components/blog/AuthorsPage';
import AboutPage from '@/components/blog/AboutPage';
import Footer from '@/components/blog/Footer';
import { User, Post, AUTH_URL, POSTS_URL } from '@/lib/types';

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
      <Navbar
        user={user}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        handleAuth={handleAuth}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <HomePage
            user={user}
            posts={posts}
            stories={stories}
            setActiveSection={setActiveSection}
            setShowAuthDialog={setShowAuthDialog}
          />
        )}

        {activeSection === 'create' && (
          <CreatePost user={user} handleCreatePost={handleCreatePost} />
        )}

        {activeSection === 'profile' && (
          <ProfilePage user={user} posts={posts} handleLogout={handleLogout} />
        )}

        {activeSection === 'blogs' && <BlogsPage posts={posts} />}

        {activeSection === 'authors' && <AuthorsPage posts={posts} />}

        {activeSection === 'about' && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}
