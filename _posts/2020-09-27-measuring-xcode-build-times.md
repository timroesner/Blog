---
layout: post
title: "Measure Xcode Build Times"
permalink: measure-xcode-build-times
image: stopwatch.jpg
---

Waiting on builds to finish is a big time drain for any iOS engineer working in a large codebase. Measuring the time it takes to do a clean build of the app is a good way to measure overall performance of your setup, but most of the time in our daily work we'll be doing incremental builds. To measure trends in those is more difficult and nuanced. A first step is to measure all build times, for that purpose we can make use of the Xcode build behaviors. In this post we will look at how we can setup a script that writes to a JSON file and collect this data.

## Setup

To get started clone [this repo](https://github.com/timroesner/BuildTimes) and compile the Swift script in terminal as follows:
```bash
$ swiftc BuildTimes.swift
```

**Note:** By default the script will store the generated data within your `Documents` directory. This makes it easily accessible and can be the same across all machines. However if you prefer to store the generated `.json` somewhere else you can go into the `BuildTimes.swift` script and modify the `func fileURL()` helper function.

Finally you need to go into the Xcode behavior settings and select the scripts to run for the corresponding trigger. I choose the `endBuild.sh` script to run for both `Succeeds` and the `Fails` behavior.

<img width="912" alt="Starts Build Behavior" src="https://user-images.githubusercontent.com/13894518/91257933-f0500580-e71f-11ea-866c-37274ea746f0.png">
<img width="912" alt="Succeeds Build Behavior" src="https://user-images.githubusercontent.com/13894518/91257938-f2b25f80-e71f-11ea-8d59-cfc6c7390da7.png">
<img width="912" alt="Screen Shot 2020-08-25 at 10 09 18 PM" src="https://user-images.githubusercontent.com/13894518/91516032-557e3500-e89f-11ea-9044-51d18a88d49c.png">

## Usage
Once you're done with the setup, it is suggested you do a build and check your Documents directory that the output file is created without issues. If you do not see a file show up after building, double check that the path you entered was correct. You can also try to trigger the `Starts` behavior manually by calling: `./BuildTimes -start`.

As soon as you have collected some data, you can ask the script to print out daily stats:
```bash
$ ./BuildTimes -list
```

Which will then output data in the following format:
```
Aug 17, 2020: 	 Total Build Time: 45m 23s 	 Average Build Time: 1m 12s
Aug 18, 2020: 	 Total Build Time: 37m 43s 	 Average Build Time: 59s
Aug 19, 2020: 	 Total Build Time: 28m 32s 	 Average Build Time: 45s
Aug 20, 2020: 	 Total Build Time: 42m 54s 	 Average Build Time: 1m 2s
Aug 21, 2020:	 Total Build Time: 33m 6s	 Average Build Time: 52s
```

## Data Format
The data is provided to you in a `JSON` format. By default it can be found in your `Documents` directory. This allows you to do more processing with the collected data.

The data model looks as follows:
```swift
date: String
lastStart: Date
totalBuildTime: TimeInterval
totalBuilds: Int
```

Here is an example of what the `JSON` format looks like:
```json
[
	{
		"date" : "Aug 24, 2020"
		"lastStart" : 620021178.24967599,
		"totalBuildTime" : 1542.219682931900024,
		"totalBuilds" : 21,
	},
	{
		"date" : "Aug 25, 2020"
		"lastStart" : 620112168.20791101,
		"totalBuildTime" : 104.5191808938980103,
		"totalBuilds" : 2,
	}
]
```   

## Summary
With this data you'll be able to measure how much time is spent waiting for builds per day, it also calculates the average build time for each day, which can be helpful to identify trends.  
Having the data available as JSON also means you can plug it into more advanced analysis, for example you can create charts to visualize it.  
Personally I've been collecting this data for a few weeks on my work machine now, and asked co-workers to do the same. On busy days we end up waiting for over 1h on builds, with a highest average build time of around 2m. Branch switching certainly contributes to the time, as a clean might be required. I've also discovered that I do more builds on Fridays, compared to other weekdays.  
If you have suggestions to improve the script, feel free to open a pull request.  