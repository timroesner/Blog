---
layout: post
title: "Explore GraphQL with Graphman"
permalink: explore-graphql-with-graphman
image: graphman.png
---

In this post we will explore an API build on [GraphQL](https://graphql.org). This type of API differs a bit from today's most common REST APIs in that we can request just the data that we need, when we need it. In order to make use of such an API in your iOS apps, I recommend using [Apollo](https://www.apollographql.com/docs/ios/), which can generate Swift models based on the GraphQL API and help with making requests.  
  
We will be working with the [GitHub GraphQL API](https://docs.github.com/en/graphql), if you want to follow along you will need to create a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

## Graphman
I've recently published a new [macOS](https://apps.apple.com/us/app/graphman/id1546167854) and [iOS](https://apps.apple.com/us/app/graphman/id1546167854) app, that allows you to prototype requests and explore GraphQL APIs. 
This post is meant to illustrate how you can use its features and help you get a better understanding of GraphQL.

## Search
First we will be writing a query that delivers us all the necessary information to build the search results page:  
<img src="./assets/images/Graphman/Search.jpeg" alt="GitHub Search Result page on iPhone" style="width:400px ! important; max-width:100%;"/>

As you can see we will need five attributes of each repository: organization, name, description, number of stars, and programming language. Thanks to GraphQL's schema, we can inspect the queries and types directly in Graphman:
![Graphman with search query and results](./assets/images/Graphman/Search-Graphman.png)

Here is the query in plain text, if you would like to copy it:
```
query search { 
  search(first: 20, query: "Swift", type: REPOSITORY) { 
	nodes { 
	  ... on Repository { 
		owner { 
		  login
		}
		name
		description
		stargazerCount
		primaryLanguage {
		  name
		}
	  }
	}
  }
}
```

### GraphQL Union
In the query above we can see the `... on` prefix in a list of results. This is what GraphQL calls a Union, which basically is a collection of multiple types. In order for us to be able to specify the properties of the correct type we need to specify which type we are querying. Other types are ignored, or can be specified separately. In this example a search can also return users or even commits, but we only care about repositories. This is not needed for a list of homogenous result types.

---

## Repository Details
Next we will write a query for the details page of a repository:  
<img src="./assets/images/Graphman/Repo-Details.jpeg" alt="GitHub Repository Details page on iPhone" style="width:400px ! important; max-width:100%;"/>

Here we need a few more properties than we requested for the search overview. But the return type will still be a `Repository` so we can use the same properties and add the ones we are missing in a new query:
![Graphman with repository details query and results](./assets/images/Graphman/Repo-Details-Graphman.png)  

Here is the query in plain text, if you would like to copy it:
```
query repository_details { 
  repository(owner: "apple", name: "swift") { 
	owner { 
	  login
	}
	name
	description
	homepageUrl
	stargazerCount
	forkCount
	viewerHasStarred
	viewerSubscription
	pullRequests { 
	  totalCount
	}
	watchers { 
	  totalCount
	}
	licenseInfo { 
	  name
	}
	ref(qualifiedName: "main") { 
	  target { 
		... on Commit { 
		  history { 
			totalCount
		  }
		}
	  }
	}
  }
}
```

## Nested Queries
GraphQL, as the name might suggest, allows user to access the Graph structure of an API. This means nodes can have other nodes. In this specific example we are able to query a list of branches and their list of commits. Here we only care about the totalCount of commits, but we could very well paginate through the list of commits on multiple branches. 

---

## Repository Pull Requests
Lastly we will make a query to request all open pull requests for a given repository:  
<img src="./assets/images/Graphman/Repo-PRs.jpeg" alt="GitHub Repository Open Pull Request page on iPhone" style="width:400px ! important; max-width:100%;"/>

For this we will be using the same initial query, but will be using completely different properties. Illustrating the flexibility of a single GraphQL type, which can be used in many different circumstances, while only delivering the info that is needed:  
![Graphman with repository details query and results](./assets/images/Graphman/Repo-PRs-Graphman.png)  

Here is the query in plain text, if you would like to copy it:
```
query pull_requests($owner: String!, $name: String!, $states: [PullRequestState!]) { 
  repository(owner: $owner, name: $name) { 
	pullRequests(first: 20, states: $states, orderBy: { 
	  field: CREATED_AT, direction: DESC 
	}) { 
	  nodes {
		number 
		title
		createdAt
		comments { 
		  totalCount
		}
		state
	  }
	}
  }
}
```

In order to query the status of the last check we can query this on the last commit. Simply add the below snippet as part of what you are querying on the `PullRequest` type:
```
commits(last: 1) { 
  nodes { 
	commit { 
	  status { 
		state
	  }
	}
  }
}
```

### Variables
I wanted to draw special attention to the usage of variables in the above query. In the previous two you saw how we can embed query input directly into the query, this time around we made the query more reusable by extracting the variables. You can see the box below the query is where we can specify these in Graphman. The variables are expected to be in standard JSON format. 

---

## Summary
I hope this was a good overview to show you the flexibility of GraphQL and how you can explore APIs with the help of Graphman. This API type is not limited to only the GitHub API, more and more companies are adopting it. Some publicly available GraphQL APIs include [Yelp](https://www.yelp.com/developers/graphql/guides/intro), [Braintree](https://graphql.braintreepayments.com), [GitLab](https://docs.gitlab.com/ee/api/graphql/), [Shopify](https://shopify.dev/docs/admin-api/graphql/reference), etc.  
