const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.reduce((favorite, blog) => {
    const { title, author, likes } = blog;
    return blog.likes >= favorite.likes ? { title, author, likes } : favorite;
  });
};

const mostBlogs = (blogs) => {
  const authors = [...new Set(blogs.map((b) => b.author))].map((a) => {
    return { author: a, blogs: 0 };
  });

  authors.forEach((author) => {
    blogs.forEach((blog) => {
      if (author.author === blog.author) {
        author.blogs += 1;
      }
    });
  });

  return authors.sort((a, b) => b.blogs - a.blogs)[0];
};

const mostLikes = (blogs) => {
  const authors = [...new Set(blogs.map((b) => b.author))].map((a) => {
    return { author: a, likes: 0 };
  });

  authors.forEach((author) => {
    blogs.forEach((blog) => {
      if (author.author === blog.author) {
        author.likes += blog.likes;
      }
    });
  });

  return authors.sort((a, b) => b.likes - a.likes)[0];
};

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
