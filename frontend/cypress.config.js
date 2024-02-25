const { defineConfig } = require("cypress");

module.exports = defineConfig({
  "defaultCommandTimeout": 5000,
  e2e: {
    baseUrl:
      process.env.NODE_ENV === "test"
        ? "http://localhost:3000"
        : "http://localhost:5000",
    env: {
      BACKEND:
        process.env.NODE_ENV === "test"
          ? "http://localhost:3003/api"
          : "http://localhost:5000/api",
    },
  },
});
