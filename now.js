{
  "version": 2,
  "name": "my-jekyll-project",
  "builds": [
    { "src": "build.sh", "use": "@now/static-build", "config": { "distDir": "_site" } }
  ]
}