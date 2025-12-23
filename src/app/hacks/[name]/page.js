import FullPost from '@/shared/blogStructure/FullPost';
import { normalizeName } from '@/utils/renderText';
import { blogPosts } from '@/utils/blog/blogData';
import { notFound } from 'next/navigation';
import Footer from '@/shared/Footer';

export function generateStaticParams() {
  return blogPosts.map(post => ({
    name: normalizeName(post.name),
  }));
}

const PostPage = async ({ params }) => {
  const { name } = await params; // Obtén el parámetro dinámico "name" desde los params

  // Normaliza el "name" de la URL y compara con el nombre en blogPosts
  const post = blogPosts.find(
    post => normalizeName(post.name) === name
  );

  // Si no se encuentra el post, mandamos al 404 global (app/not-found.js)
  if (!post) {
    notFound();
  }

  return (
    <>
      <div>
        <FullPost post={post} featuredPosts={blogPosts} />
      </div>
      <Footer />
    </>
  );
};

export default PostPage;
