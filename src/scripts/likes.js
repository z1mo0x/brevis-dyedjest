import { supabase } from "../supabase";

let isProcessing = false; // флаг, чтобы блокировать параллельные запросы

export async function likePost({ id, likeActive, setLikeActive, setLikesCount }) {
  if (isProcessing) return;
  isProcessing = true;

  if (likeActive) {
    await dislikePost({ id, setLikeActive, setLikesCount });
    isProcessing = false;
    return;
  }

  setLikeActive(true);

  // Получаем текущее значение лайков из БД, чтобы избежать конфликтов
  const { data: post, error: fetchError } = await supabase
    .from('news')
    .select('likes')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Ошибка получения лайков:', fetchError.message);
    setLikeActive(false);
    isProcessing = false;
    return;
  }

  const newLikes = (post.likes || 0) + 1;

  // Обновляем лайки в БД
  const { data, error } = await supabase
    .from('news')
    .update({ likes: newLikes })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Ошибка обновления лайков:', error.message);
    setLikeActive(false);
    isProcessing = false;
    return;
  }

  setLikesCount(data.likes);

  // Обновляем localStorage
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  if (!likedPosts.includes(id)) likedPosts.push(id);
  localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

  isProcessing = false;
}

export async function dislikePost({ id, setLikeActive, setLikesCount }) {
  if (isProcessing) return;
  isProcessing = true;

  setLikeActive(false);

  const { data: post, error: fetchError } = await supabase
    .from('news')
    .select('likes')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Ошибка получения лайков:', fetchError.message);
    setLikeActive(true);
    isProcessing = false;
    return;
  }

  const newLikes = Math.max((post.likes || 1) - 1, 0);

  const { data, error } = await supabase
    .from('news')
    .update({ likes: newLikes })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Ошибка обновления лайков:', error.message);
    setLikeActive(true);
    isProcessing = false;
    return;
  }

  setLikesCount(data.likes);

  // Обновляем localStorage
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  const updatedLikedPosts = likedPosts.filter(postId => postId !== id);
  localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));

  isProcessing = false;
}
