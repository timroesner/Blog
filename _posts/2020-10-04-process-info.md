---
layout: post
title: "ProcessInfo for Test Data and more"
permalink: process-info
image: pcb.jpg
---

ProcessInfo is a class that has been around since the first iPhoneOS SDK, and with recent years is has gotten some new APIs. Furthermore some newer Xcode features like XCTestplan are making use of the arguments and environment, which can be passed through the ProcessInfo. In this post we'll be looking closer at how you can use it to inject test data into your app when it is executed with certain arguments, and what else ProcessInfo has to offer.

## ProcessInfo
This is the main class under which the properties we'll be looking at are available. In contrast to modern Apple APIs the shared instance is accessible under the `processInfo` property, which offers access to the shared process information.  

### arguments
This property returns an array of strings, which can be passed through Xcode schemes, XCTestplans or XCUIApplication, and even the command line. Accessing the arguments is easy and can be done as follows:  
```swift
if ProcessInfo.processInfo.arguments.contains("Promo") {
	TestData.create()
}
```  
In the above example we're using the `Promo` argument to create consistent test data for screenshots.

### environment 
If we need to pass more than just a flag, we can use the environment, which is a dictionary that allows us to pass String values. This is a bit more flexible as we can pass actual values, for example we could use a dedicated API key for testing:
```swift
let apiKey = ProcessInfo.processInfo.environment["apiKey"] ?? productionKey
```
  
I'm sure you have many more ideas for what these arguments and the environment can be useful. Next I want to look at places within Xcode and the XCTest framework, where we can pass these arguments.  

### Xcode Scheme
![Xcode Scheme Editor](./assets/images/ProcessInfo/XcodeScheme.png)  
Within the Xcode Scheme Editor we can define arguments and environment variables which are passed on launch. Very convenient here is the option to uncheck these when they are not needed.  

### XCTestplan
![XCTestplan Configurations](./assets/images/ProcessInfo/XCTestplanConfig.png)  
XCTestplan is a feature that was introduced with Xcode 11, it allows us to create different configurations which are then executed with the specified tests. I've previously written about how I leverage these to [quickly generate screenshots in multiple languages](/automated-screenshots-with-xctestplan).  
But in addition to the language we can also pass arguments and environment variables, which can be read through ProcessInfo. This can be particular helpful if you want to run your tests with configurations that have different arguments, or pass different environment variables. For example you could define an apiKey that also depends on the language.  

### XCUIApplication
If you're not yet using XCTestplan, don't worry. As the XCTest framework also allows to pass these variables programatically. We do this by using the `XCUIApplication` as follow:
```swift
let app = XCUIApplication()
app.launchArguments.append("Promo")
app.launchEnvironment["apiKey"] = "token123"
app.launch()
```

### Default Values
Now we have seen how we can pass custom arguments and values through ProcessInfo, however there are also some default arguments and values that can be particular helpful in certain situations.  

**operatingSystemVersion**  
The `operatingSystemVersion` property returns a struct, from which you can access the `majorVersion`, `minorVersion`, and `pathVersion`. This property is often used in analytics, but can also help modify behavior of your app that depends on a certain version. However in the latter case you should consider using `if @available(...)` when possible.

**isMacCatalystApp**  
This argument is new with iOS 13.0, and can help determine if your iOS app is running as a Mac Catalyst app on macOS. You can then use this to modify styling or assets for the macOS platform.

**isiOSAppOnMac**  
This argument is currently in beta and will become available with macOS 11. It is to indicate if your iOS app is running natively on macOS, which will be possible for Apple Silicon Macs.

**thermalState**  
An enum which you can use to get the current thermalState of the device, the possible values are: `nominal`, `fair`, `serious`, and `critical`.

**isLowPowerModeEnabled**  
This argument will let you know if the user has Low Power Mode enabled. When this is true your app should refrain from using too much power, and can be used to disable non-critical, but power intensive tasks.  

## Summary
`ProcessInfo` is a powerful API that is often overlooked when we're not working on the Command Line. However it can be helpful for many iOS applications, for example to inject consistent data for testing and screenshots, among other things. Many developers are not aware of the default values that the `ProcessInfo` class offers us, even though these can be very helpful.  

