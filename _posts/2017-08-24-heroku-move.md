---
layout: post
title: Moving from rhcloud to heroku
permalink: moving-to-heroku
image: server.jpg
---

The day has come, after debating a while if I should take it on me to update to the newest version of [ghost](https://ghost.org), I finally decided to combine this with a move away from rhcloud as they are discontinuing their current web service. 

I was using rhcloud version 2 and version 3 does not fit my needs which is why I decide on heroku, a scalable docker service similar to version 2 of rhcloud. Unfortunately I am not able to store images on heroku, but I can solve this with some free firebase storage from where I can copy the URL.

I have also moved my personal website [timroesner.com](http://timroesner.com) from rhcloud to firebase hosting which even provide a SSL certificate for free, which I am very happy about. 

So far my technical update for today.

**Update 8/25:** Today came the email announcing September 30th as the end of life date for rhcloud version 2. That's timing!