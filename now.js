{
  "version": 2,
  "name": "my-blog",
  "alias": ["blog.timroesner.com", "www.blog.timroesner.com"],
  "builds": [
    { "src": "build.sh", "use": "@now/static-build", "config": { "distDir": "_site" } }
  ]
}