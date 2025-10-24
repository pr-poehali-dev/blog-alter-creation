import { useState, useEffect } from 'react';
import Navbar from '@/components/blog/Navbar';
import HomePage from '@/components/blog/HomePage';
import CreatePost from '@/components/blog/CreatePost';
import ProfilePage from '@/components/blog/ProfilePage';
import BlogsPage from '@/components/blog/BlogsPage';
import AuthorsPage from '@/components/blog/AuthorsPage';
import AboutPage from '@/components/blog/AboutPage';
import Footer from '@/components/blog/Footer';
import StoriesBar from '@/components/stories/StoriesBar';
import StoryViewer from '@/components/stories/StoryViewer';
import CreateStoryDialog from '@/components/stories/CreateStoryDialog';
import MessagesPage from '@/components/messages/MessagesPage';
import ReelsPage from '@/components/reels/ReelsPage';
import MobileBottomNav from '@/components/blog/MobileBottomNav';
import { User, Post, AUTH_URL, POSTS_URL, MESSAGES_URL } from '@/lib/types';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [viewingStoryUserId, setViewingStoryUserId] = useState<number | null>(null);
  const [allStoryUsers, setAllStoryUsers] = useState<number[]>([]);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    loadPosts();
    loadStories();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch(`${MESSAGES_URL}?action=get_chats&user_id=${user.id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const count = data.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
          
          if (count > prevUnreadCount && prevUnreadCount > 0 && soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Audio play failed:', err));
          }
          
          setPrevUnreadCount(count);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [user, prevUnreadCount]);

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
      if (response.ok && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        setShowAuthDialog(false);
        setActiveSection('profile');
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

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
  };

  const handleStoryClick = (userId: number, allStories: any[]) => {
    setViewingStoryUserId(userId);
    setAllStoryUsers(allStories.map(s => s.user_id));
  };

  const handleNextStory = () => {
    if (!viewingStoryUserId) return;
    const currentIndex = allStoryUsers.indexOf(viewingStoryUserId);
    if (currentIndex < allStoryUsers.length - 1) {
      setViewingStoryUserId(allStoryUsers[currentIndex + 1]);
    } else {
      setViewingStoryUserId(null);
    }
  };

  const handlePrevStory = () => {
    if (!viewingStoryUserId) return;
    const currentIndex = allStoryUsers.indexOf(viewingStoryUserId);
    if (currentIndex > 0) {
      setViewingStoryUserId(allStoryUsers[currentIndex - 1]);
    } else {
      setViewingStoryUserId(null);
    }
  };

  const refreshStories = () => {
    window.location.reload();
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
        unreadCount={unreadCount}
      />

      {activeSection !== 'reels' && (
        <StoriesBar
          currentUserId={user?.id || null}
          onStoryClick={handleStoryClick}
          onCreateStory={() => setShowCreateStory(true)}
        />
      )}

      <main className={`${activeSection === 'reels' ? '' : 'container mx-auto px-4 py-8'} pb-20 md:pb-8`}>
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
          <ProfilePage 
            user={user} 
            posts={posts} 
            handleLogout={handleLogout} 
            onProfileUpdate={handleProfileUpdate}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
        )}

        {activeSection === 'blogs' && <BlogsPage posts={posts} />}

        {activeSection === 'authors' && <AuthorsPage posts={posts} />}

        {activeSection === 'messages' && <MessagesPage user={user} onUnreadCountChange={setUnreadCount} />}

        {activeSection === 'about' && <AboutPage />}

        {activeSection === 'reels' && <ReelsPage user={user} />}
      </main>

      {activeSection !== 'reels' && <Footer />}

      <MobileBottomNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        unreadCount={unreadCount}
      />

      {viewingStoryUserId && (
        <StoryViewer
          userId={viewingStoryUserId}
          currentUserId={user?.id || null}
          onClose={() => setViewingStoryUserId(null)}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
        />
      )}

      <CreateStoryDialog
        user={user}
        open={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSuccess={refreshStories}
      />
    </div>
  );
}