---
layout: post
title: Moving to Jekyll hosted on Zeit Now
permalink: new-blog-new-infra 
---

I moved my blog, again. But this time I also switched out the underlying framework. Previously I was using Ghost and hosted on Heroku. Before I go in depth into the how I moved, I wanted to point out some pain points I had and why I moved in the first place. 

Heroku: 
- Startup time on site access
- Couldn't setup custom domain
- No static storage for images

Ghost:
- Painful upgrade process
- Layout issues
- Too much bulk (Database, Node.js, etc)

The above could have certainly been solved with taking some money in hand and moving to Digital Ocean or similar, and even though I liked Ghost as a platform a lot, I wanted something that could serve my site in pure HTML/CSS, as lightweight as possible, and allow me to keep writing my posts in markdown. 
I've heard [John Sundell](https://www.swiftbysundell.com) raving about static site generators, and he is working on one that is written in Swift. However that one is not open source just yet, which prompted me to explore other options. While researching I found Jekyll, which I've heard good things about previously. While looking into it, it seemed to check all my boxes:

1. Writing posts in Markdown  
2. Custom templates
3. Custom CSS
4. Image storage
5. No database
6. Easy upgrades
7. Fast and lightweight site

The only down side is that when I publish a post I have to push the changes. But with a nifty GitHub integration from Zeit I can do it with a PR. Which also has the advantage of having all files under source control should something ever break. 

So let's get into the details of how. First you need to install Jekyll on your machine with `$ gem install bundler jekyll --user-install`. Then create a new Jekyll project with `$ jekyll new my-blog-title`.

This creates a new directory in which you will find a few files and folder. Most interesting to us is the `_posts` directory in which you will store all your markdown files.  
Jekyll has a weird naming convention where you have to start everything with `YYYY-MM-DD-`, however this totally makes sense because posts are ordered. So if you want to display your posts in a timeline like list on your main page, or if you want to have the option to go to the next / previous post it's important that you adhere to this, otherwise your posts cannot be sorted.  
If you don't care about order, and find this naming convention unnecessary you can simply use the `_pages` directory and forego the date naming convention. 

When it comes to the design of your blog you already have a default theme called minima, if that is too minimal for you, there is a whole [list of themes](https://jekyllthemes.io) you can choose from.  
However if you want to create a completely custom look with your own CSS, you can do so as well. For that you create a folder called `_layouts` in which you can put your HTML templates. Here is a good [tutorial](https://jekyllrb.com/docs/layouts/) that goes over how it all works.

Another important directory that you should create is `assets`. Here you can put subfolders for images or stylesheets, which will be part of your generated site and accessible under the same path. 

You can test your site locally with the command `$ jekyll serve`. It sadly does not offer auto reload out of the box, but a simply `cmd + R` will show you the changes you made.

Once you have everything to your taste, it is time to deploy your new blog. I decided on Zeit Now, because it's free and they offer the ability to build your PRs and subsequent commits, so you can see your changes in a production environment. They give you a custom URL for each PR so you can test on other devices, like mobile as well.

In order to get the deploy working correctly you need two things. First a build script and second a now.json file. 
  
 
### build.sh
```
yum install ruby23-devel.x86_64

gem install jekyll bundler

bundle install

jekyll build
```

### now.json
```json
{
  "version": 2,
  "name": "my-blog",
  "alias": ["blog.timroesner.com", "www.blog.timroesner.com"],
  "builds": [
    { "src": "build.sh", "use": "@now/static-build", "config": { "distDir": "_site" } }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1.html" }
  ]
}
```

The alias is the custom URL of my blog, in order to have this work you need to [add your domain to your Zeit account](https://zeit.co/docs/v2/domains-and-aliases/adding-a-domain).  
Furthermore I use the permalink feature in Jekyll to shorten the URLs, in order for this to work I needed to add a custom route in my now.json that fetches the correct HTML file. 

### Summary
Overall I'm very happy with my new setup. I was able to remove the pain points I had, and made my blog much faster and easier to maintain. I have a lot more control over things now, which allowed me to support automatic dark mode switching, and use my custom layouts. So far only advantages with this new setup. 






