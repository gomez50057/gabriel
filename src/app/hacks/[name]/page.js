import FullPost from '../../../components/blog/FullPost';
import { blogPosts, normalizeName } from '../../../utils/blogData';

const PostPage = ({ params }) => {
  const { name } = params; // Obtén el parámetro dinámico "name" desde los params

  // Normaliza el "name" de la URL y compara con el nombre en blogPosts
  const post = blogPosts.find(
    post => normalizeName(post.name) === name
  );

  // Si no se encuentra el post, podrías manejar el 404 aquí
  if (!post) {
    return <p>Post no encontrado</p>;
  }

  return (
    <div>
      <FullPost post={post} featuredPosts={blogPosts} />
    </div>
  );
};

export default PostPage;
