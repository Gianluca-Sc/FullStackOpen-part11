const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blogs");
const User = require("../models/users");

const api = supertest(app);

const initialBlogs = [
  {
    title: "Il primo post",
    author: "Gino",
    url: "www.nonloso.com",
    likes: 2,
  },
  {
    title: "Il secondo post",
    author: "Franco",
    url: "www.nonloso2.com",
    likes: 10,
  },
];

let token;

beforeAll(async () => {
  await User.deleteMany({});

  await api
    .post("/api/users")
    .send({
      username: "Mario_Rossi",
      name: "Mario Rossi",
      password: "password",
    })
    .expect(201);

  const tokenRequest = await api
    .post("/api/login")
    .send({
      username: "Mario_Rossi",
      password: "password",
    })
    .expect(200);
  token = "Bearer " + tokenRequest.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObject.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe("Blog api", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("_id to id", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });

  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "Il nuovo post",
      author: "Bartolomeo",
      url: "nonloso.com",
      likes: 4,
    };

    const savedBlog = await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(newBlog)
      .expect(201);

    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(savedBlog.body.author).toBe("Bartolomeo");
  });

  test("Add a blog without token", async () => {
    const newBlog = {
      title: "Il nuovo post",
      author: "Bartolomeo",
      url: "nonloso.com",
      likes: 4,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);
  });

  test("likes have default values of zero", async () => {
    const newBlog = {
      title: "Il nuovo post",
      author: "Bartolomeo",
      url: "nonloso.com",
      likes: 4,
    };
    const savedBlog = await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(newBlog)
      .expect(201);

    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(savedBlog.body.author).toBe("Bartolomeo");
  });
});

test("fails with status code 400 if data invalid", async () => {
  const newBlog = {
    title: "Il nuovo post",
    author: "Bartolomeo",
    likes: 4,
  };
  await api
    .post("/api/blogs")
    .set("Authorization", token)
    .send(newBlog)
    .expect(400);
});

test("Delete a blog", async () => {
  const newBlog = {
    title: "Il nuovo post",
    author: "Bartolomeo",
    url: "nonloso.com",
    likes: 4,
  };

  const savedBlog = await api
    .post("/api/blogs")
    .set("Authorization", token)
    .send(newBlog);

  await api
    .delete(`/api/blogs/${savedBlog.body.id}`)
    .set("Authorization", token)
    .expect(204);
});

test("Update a blog", async () => {
  const blogs = await api.get("/api/blogs");
  const id = blogs.body[0].id;

  const response = await api
    .put(`/api/blogs/${id}`)
    .send({ likes: 50 })
    .expect(200);
  expect(response.body.likes).toBe(50);
});

describe("User creation", () => {
  test("Username must be unique", async () => {
    await User.create({
      username: "frazz",
      name: "gino",
      password: "password",
    });

    const userObject = {
      username: "frazz",
      name: "franco",
      password: "password",
    };
    const response = await api.post("/api/users").send(userObject).expect(400);
    expect(response.body.error).toContain("expected `username` to be unique");
  });

  test("Password missing", async () => {
    const userObject = { username: "frazz", name: "franco" };
    const response = await api.post("/api/users").send(userObject).expect(400);
    expect(response.body.error).toBe("missing required fields");
  });

  test("Username missing", async () => {
    const userObject = { username: "frazz", name: "franco" };
    const response = await api.post("/api/users").send(userObject).expect(400);
    expect(response.body.error).toBe("missing required fields");
  });

  test("Username must be at least 3 characters long", async () => {
    const userObject = {
      username: "f",
      name: "franco",
      password: "password",
    };
    const response = await api.post("/api/users").send(userObject).expect(400);
    expect(response.body.error).toBe(
      "User validation failed: username: username must be at least 3 characters long"
    );
  });

  test("Password must be at least 3 characters long", async () => {
    const userObject = {
      username: "franzzz",
      name: "franco",
      password: "p",
    };
    const response = await api.post("/api/users").send(userObject).expect(400);
    expect(response.body.error).toBe(
      "password must be at least 3 characters long"
    );
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
