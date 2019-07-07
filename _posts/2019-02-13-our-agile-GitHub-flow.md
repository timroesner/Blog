---
layout: post
title: Our agile GitHub flow
permalink: our-agile-github-flow
image: "team.jpg"
---
*This post is aimed at the project teams that I am currently working with*
<br/>
### Step 1
Look in the current sprint for a ticket that you want to complete. Drag it into "In progress" and assign yourself to it. This means you have now taken ownership and are responsible for this task. 
![Screen-Shot-2019-02-13-at-4.22.36-PM](https://user-images.githubusercontent.com/13894518/52753541-e89c9600-2fab-11e9-8799-7a217d47c795.png)
It is okay if more than one person works on a ticket, however there should only be one owner assigned to it. 
<br/>
### Step 2
Next you will create a branch where you implement this ticket. Make sure you are basing this branch on the latest version of master. Creating a branch can be done through `$ git checkout -b 72-implement-stubs` or with your favorite git client. We will use the format of "ticketnumber-description", this ensures that we will never create branches with the same name. 
<br/>
### Step 3 
Write the code to implement this ticket. Make sure you read the description closely, to ensure that you don't miss details. If you are unsure about certain aspects of your ticket you can always message me on Slack to get clarification.
<br/>
### Step 4
Periodically [commit](https://help.github.com/articles/adding-a-file-to-a-repository-using-the-command-line/) your changes. If you run into issues with git, I highly recommend the [git-flight-rules](https://github.com/k88hudson/git-flight-rules#flight-rules-for-git) which have helped me a lot if things went south. 
<br/>
### Step 5
When you finished all the tasks, including writing unit tests for your code, you want to open a pull request(PR) to request your changes to be merged into master. 
![new_pull_request](https://user-images.githubusercontent.com/13894518/52754191-7da08e80-2fae-11e9-89aa-39353916b714.png)
<br/>
### Step 6
Name your PR something descriptive, make sure you add the current sprint (project) on the right hand column, and add the description "Closes #ticketnumber". This is important, because it will make the reviewers life easier, as they can navigate with just one click to the ticket you implemented and it will also automatically close the ticket once the PR is merged. Here is a screen shot of such a PR:
![PR_example](https://user-images.githubusercontent.com/13894518/52754496-99586480-2faf-11e9-9070-e71ce64fd312.png)
<br/>
### Step 7
After you opened the PR a couple automatic checks will be triggered. They often take a couple minutes to run, so you can relax a little. However make sure that all these checks pass, otherwise your branch cannot be merged. If you have any questions about failing checks, or merge conflicts feel free to reach out. 
<br/>
### Step 8
If all your checks pass, your work is done. Unless of course the person reviewing your PR requests changes. 

<br/>  

# The Code Review process

### Step 1
As developer it is your responsibility to review the code of your team members. Thanks to our project board it is really easy to spot if a PR is ready to be reviewed:
![Needs_Review](https://user-images.githubusercontent.com/13894518/52755025-657e3e80-2fb1-11e9-852f-f7fc8045a4a5.png)
This is what an open PR in the "Needs Review" column looks like. Notice the green checkmark which means that all checks passed, if checks are failing you will see a red cross and the PR is not yet ready. This one however is ready, and requires your review. 
<br/>
### Step 2
Before you start your review you want to make sure that you drag the PR into the "In Review" column, which will let others know that this PR is already under review. This prevents two people from reviewing the same PR, and ensures we use our time effectively. 
<br/>
### Step 3
Looking at the picture in Step 6 above, you can see that a good PR will always mention the ticket that it relates to. Begin with that ticket to familiarize yourself with what needed to be done. 
<br/>
### Step 4
Once you know what this PR tries to accomplish you can begin your code review. This should be both dynamic and static, which means for dynamic code review you will check out this branch on your local machine and run the app. (Unless you use React, in which case you can view the deployed PR)
<br/>
### Step 5
Once you clicked through the new feature you want to ensure that the code is understandable and follows our standards. For this you want to go to the "Files changed" tab.
![Files_changed](https://user-images.githubusercontent.com/13894518/52755573-4d0f2380-2fb3-11e9-8c85-ff4d98129d28.png)
Here you can see all the changes that have been made. Feel free to comment on lines you don't understand or find questionable. You can also leave general comments. 
<br/>
### Step 6
Once you are done you can either give your approval or request changes from the owner. 
<br/>
### Step 7
If you gave your approval, maybe after a second review, it is your responsibility to merge the PR. Make sure the associated ticket was also closed, this should happen automatically if it is referenced at the top. 
<br/>
# Reviewing a Spike
Not all tickets will have a PR associated with it, for these special cases the owner should post a link to a document which you can then review. 
**All spikes need an associated Google doc**
<br/>
## Summary
I hope this helped to illustrate the work flow we will be following. If you have any questions or suggestions please reach out. 