import { supabase } from "../supabase";

export async function likePost({ id, likesCount, setLikesCount, likeActive, setLikeActive }) {
    if (likeActive) {
      await dislikePost({ id, likesCount, setLikesCount, likeActive, setLikeActive });
      return;
    }
  
    setLikeActive(true);
    setLikesCount(prev => prev + 1);
  
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (!likedPosts.includes(id)) likedPosts.push(id);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  
    const { data, error } = await supabase
      .from('news')
      .update({ likes: likesCount + 1 })
      .eq('id', id)
      .select()
      .single();
  
    if (error) {
      setLikeActive(false);
      setLikesCount(prev => prev - 1);
  
      const revertedLikedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]').filter(postId => postId !== id);
      localStorage.setItem('likedPosts', JSON.stringify(revertedLikedPosts));
    } else {
      setLikesCount(data.likes);
    }
  }
  
  export async function dislikePost({ id, likesCount, setLikesCount, likeActive, setLikeActive }) {
    setLikeActive(false);
    setLikesCount(prev => prev - 1);
  
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const updatedLikedPosts = likedPosts.filter(postId => postId !== id);
    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
  
    const { data, error } = await supabase
      .from('news')
      .update({ likes: likesCount - 1 })
      .eq('id', id)
      .select()
      .single();
  
    if (error) {
      setLikeActive(true);
      setLikesCount(prev => prev + 1);
  
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } else {
      setLikesCount(data.likes);
    }
  }