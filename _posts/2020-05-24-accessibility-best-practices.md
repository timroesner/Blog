---
layout: post
title: "Accessibility Best Practices"
permalink: accessibility-best-practices
image: Accessibility-Header.png
---

Accessibility is an important corner stone of iOS development, as it enables all people to use your apps, no matter their abilities. Fortunately UIKit offers many APIs, which allow Developers to offer support for system technologies within their apps. Most of these technologies and APIs can be grouped into three categories:

<img class="invert-on-dark" alt="Motor, Vision, and Hearing" src="./assets/images/Accessibility-Best-Pratices/Accessibility-Areas.svg">

Voice Control, or Switch Control are examples of technologies that help users with motor disabilities. VoiceOver and Dynamic Font help people with vision impairments. While haptics and closed captions help those with hearing loss. 

Apps today heavily rely on visual components and touch interactions for navigation and actions. This can get especially difficult when you don't have these abilities. I highly encourage you to turn on Voice Over (with screen curtain) and Voice Control, to better understand how these technologies are used to navigate your app.

## UIAccessibility
Most APIs we'll be looking at are grouped under `UIAccessibility`. Chances are you have seen some of these already but may not know how to best use them yet.  

### accessibilityLabel
This label will be the first thing that is read out to VoiceOver user, and is displayed to Voice Control users for elements that offer user interaction. If you use standard UIKit components you will get this for free, as long as they display some sort of text. However if you have a button that relies completely on a visual icon to convey its purpose you need to add a label yourself:

```swift
addButton.accessibilityLabel = NSLocalizedString("Add new flight", comment: "...")
```

We want to make sure to localize this label as well, so users who's preferred language is not English are able to understand it. Furthermore we want to be sure that we convey intent and provide context. We could have simply made the label "Add" but without the necessary visual clues it is not clear what this action might refer to.

### accessibilityUserInputLabels
This property is new since iOS 13 and specifically applies to Voice Control. By default Voice Control will use the `accessibilityLabel`, but this optional array of Strings allows the developer to specify shorter variations that are easier to refer to by the user.

```swift
addButton.accessibilityUserInputLabels = [
	NSLocalizedString("Add", comment: "..."), 
	NSLocalizedString("New flight", comment: "...")
]
```

### accessibilityValue
Values are generally properties of an element that can change, for example if something is selected or not. They are read after the label and read again if they change while the element stays focused by VoiceOver. Some standard UIKit components already make use of them, but sometimes we have custom states. For those we can add a value like this:

```swift
flightCell.accessibilityValue = flight.status.localizedDescription

extension Flight.Status {
	var localizedDescription: String {
		switch self {
		case .onTime:
			return NSLocalizedString("On Time", comment: "...")
		case .delayed:
			return NSLocalizedString("Delayed", comment: "...")
		case .cancelled:
			return NSLocalizedString("Cancelled", comment: "...")
		}
	}
}
```

### accessibilityHint
Hints are read last after a short pause, as long as the element is still in focus. It can be used to convey additional instructions for elements that perform an action. I personally like to include the phrase "Double tap to..", which is in line with Apple's system apps.

```swift
flightCell.accessibilityHint = NSLocalizedString("Double tap to view more details", comment: "...")
```

### accessibilityTraits
This array of properties defines the capabilities of an element. They are read to the user as information, but some also offer additional functionality like the `adjustable` trait.

| Trait | Description |
|---|---|
| button | Treat element as button |
| link | A tappable link, which brings the user to a website. These can be directly navigated through with the rotor. |
| searchField | A search field |
| image | A visual graphic. Should be used when the visual appearance conveys additional information. Can be combined with other traits. |
| selected | Used to describe the state of an element. For example used for tab bar items. |
| playsSound | Element plays a sound once the action is performed |
| keyboardKey | Treat element as a keyboard key |
| staticText | Text that cannot change |
| summaryElement | Element provides summary information, which is read on first load. Each view may only have one summary element. |
| notEnabled | Element is disabled and does not respond to user interaction. Read out as "dimmed". |
| updatesFrequently | Element frequently updates its label or value. Makes sure that VoiceOver doesn't fall behind when reading updates. |
| startsMediaSession | Causes VoiceOver to not read back the element when activated, so the sound can play without interruptions. |
| adjustable | Allows adjustments through increment and decrement methods. Will append ", swipe up or down to adjust the value." to your hint. |
| allowsDirectInteraction | Useful for drawing apps or other elements where interactions can not be controlled by VoiceOver. |
| causesPageTurn | Element causes an automatic page turn when VoiceOver finished reading it |
| header | Divides content into sections. These can be directly navigated through with the rotor. |

### accessibilityViewIsModal
A boolean flag that should be set on a view that is presented modally on top of another. This is important because by default all elements on screen can be navigated to with VoiceOver. Setting this property to true tells VoiceOver to ignore elements that are not part of the view's hierarchy.

```swift
modalViewController.view.accessibilityViewIsModal = true

modalViewController.modalPresentationStyle = .overCurrentContext
present(modalViewController, animated: true, completion: nil)
```

## Grouping
Most VoiceOver users swipe horizontally to navigate through the different elements within your app. Having to step through every label can take a while and also confuse users when information that belongs together visually is not grouped together when navigating with VoiceOver. To solve this we need to group information that belongs together.  
If you already group these elements together in the same parent for layout purposes then you can simply do the following:

```swift
// containerView subviews: nameTitleLabel, nameLabel
containerView.isAccessibilityElement = true
containerView.accessibilityLabel = "\(nameTitleLabel.text ?? ""), \(nameLabel.text ?? "")"
```

Setting the `isAccessibilityElement` to true on the containerView will automatically hide the subviews, `nameTitleLabel` and `nameLabel`, from VoiceOver. We then compose the containers accessibility label from the text of the two contained labels. Adding a comma between the two adds a pause while VoiceOver reads them out.  
However wrapping all your views that belong together in a container view might clutter your view hierarchy. As a second option we can group elements by providing a custom array of `accessibilityElements`:

```swift
override var accessibilityElements: [Any]? = {
	let nameElement = UIAccessibilityElement(accessibilityContainer: self)
	nameElement.accessibilityLabel = "\(nameTitleLabel.text ?? ""), \(nameLabel.text ?? "")"
	nameElement.accessibilityFrameInContainerSpace = nameTitleLabel.frame.union(nameLabel.frame)
    	
	let cityElement = UIAccessibilityElement(accessibilityContainer: self)
	cityElement.accessibilityLabel = "\(cityTitleLabel.text ?? ""), \(cityLabel.text ?? "")"
	cityElement.accessibilityFrameInContainerSpace = cityTitleLabel.frame.union(cityLabel.frame)
    
	return [nameElement, cityElement]
}()
```
Here we create UIAccessibilityElements, which are only visible to VoiceOver, and group the labels that belong together. But since it is not a UIView, we have to manually provide the frame of the element. This is important so that VoiceOver knows what elements to focus after it received a touch event at a certain location. 
Also notice how this is NOT a computed property, since VoiceOver expects a consistent array of `acccessibilityElements`. If your elements and labels might change while they are on screen, then it is best to have a cache of `accessibilityElements` which can be set to `nil` once a change occurred. 

## User Settings
Looking at the Accessibility section within the system settings, we can see a lot of features that can be turned on or off by the user. Additionally these user settings are also exposed to developers through `UIAccessibility`, so that third party apps can adhere to them. Here is a list of all the exposed settings, as of iOS 13:

```swift
// UIAccessibility

isAssistiveTouchRunning
isBoldTextEnabled
isClosedCaptioningEnabled
isDarkerSystemColorsEnabled
isGuidedAccessEnabled
isGrayscaleEnabled
isInvertColorsEnabled
isMonoAudioEnabled
isReduceMotionEnabled
isReduceTransparencyEnabled
isShakeToUndoEnabled
isSpeakScreenEnabled
isSwitchControlRunning
isVideoAutoplayEnabled
isVoiceOverRunning
```

`UIAccessibility` also offers Notifications that can be subscribed to in order to observer changes in these settings while your app is running. Since the system already respects these settings, so should we as developers within our apps. Let's look at some of them in more detail:

### Darker System Colors
This setting changes the system colors to increase contrast between text and background. If you are using custom colors you should also adjust these for higher contrast, meaning darker by default and slightly lighter in Dark Mode. Within the Xcode Asset Catalog we can find a "High Contrast" check box that then allows us to provide these variants. If you define your colors within code you can simply check this property to determine which variant to return.

### Reduce Motion
Reducing motion referees to animations that involve a lot of translations and scaling. When turned on the system replaces most of these with simple cross fade animations. If you also use animations that rely heavily on transforms in your app you should check for this property and provide crossfade alternatives.

### Reduce Transparency
Semi transparent backgrounds have been a heavily used design element since iOS 7. They can be nice to provide a sense of hierarchy, and make views more unique. However they don't always offer the best contrast. When this setting is turned on apps should always display text with a solid background, and dim the background behind partial modal views to create more contrast.

## Layout Changes
For a visual user it is easy to understand when a new information appears on screen. VoiceOver users however might not have the changing element in focus, causing them to miss this information. For those changes we can post one of the following Notifications to UIAccessibility:

```swift
UIAccessibility.post(notification: .layoutChanged, argument: updatedView)
UIAccessibility.post(notification: .screenChanged, argument: newScreen)
UIAccessibility.post(notification: .announcement, argument: NSLocalizedString("Your Announcement", comment: "..."))
```
Most of the time you will post the `layoutChanged` Notification, here you can pass the subview that has changed or newly appeared on screen and VoiceOver will directly focus on it and read it to the user. If you pass `nil` it will simply focus on the first view in the hierarchy.
The `screenChanged` Notification is useful when you present a new ViewController as modal. If it's not a modal presentation VoiceOver will automatically focus on the new screen.    
Lastly the `announcement` Notification can be used to read out text to the user, this can be useful when there is no UI change, or a temporary view is displayed, for example a toast.

## Gestures
The following are some gestures VoiceOver users can perform to interact with certain elements more directly. It is helpful to add a hint to the element that you are implementing these gestures for.

### Increment & Decrement
As discussed above an element can be adjustable, for example a stepper where the user increments and decrements the value. This can also be used to navigate through a carousel view, or if you have some custom input view like a rating. Once you set the `adjustable` trait on the element, the system automatically appends to your hint, and you can override the following two methods to implement your custom increment / decrement behavior:

```swift'
override func accessibilityIncrement() {
	...
}

override func accessibilityDecrement() {
	...
}
```

### Escape Gesture
This gesture can be performed by drawing a "Z" shape with two fingers. It is commonly used to escape a modal alert, or otherwise dismiss a view that doesn't have a dedicated dismiss button. There is no trait for this gesture, so be sure to include a hint.

```swift
override func accessibilityPerformEscape() -> Bool {
	// return true if dismiss was successful 
}
```

### Magic Tap 
This gesture can be performed with a two finger double tap, and should perform the main action of the app. If you have a music or podcast app this might be play / pause, or the phone app for example uses it for answering phone calls and hanging up. The implementation will therefor entirely depend on your app's functionality.

```swift
override func accessibilityPerformMagicTap() -> Bool {
	// return true if the action was successful
}
```

## Custom Actions
If the above gestures didn't cover all your use cases you can also expose custom actions.  You can specify a name for those and they can be navigated with a swipe up or down and executed with a double tap. For example if you offer actions through a long press or context menu, then those should be exposed as custom actions so they can be performed by assistive technologies as well. 

```swift
airportView.accessibilityCustomActions = [
	UIAccessibilityCustomAction(name: NSLocalizedString("View in Maps", comment: "..."), actionHandler: { [weak self] in
		self?.viewInMaps(airport.address)
	})
	
	UIAccessibilityCustomAction(name: NSLocalizedString("Get Directions", comment: "..."), actionHandler: { [weak self] in
		self?.getDirections(to: airport.address)
	})
]
```

## Haptics
We now looked at many APIs of assistive technologies for users with motor or vision impairments. But as mentioned at the beginning, we can also improve our app for users with hearing loss. First lets look at haptics, which can be a great substitute for sound. Haptics are much more than simple vibrations, as we can adjust intensity and also produce unique and recognizable patterns. Apple provides three different `UIFeedbackGenerators` that are used to produce these haptic feedbacks:

```swift
// Selection
let selectionGenerator = UISelectionFeedbackGenerator()
selectionGenerator.selectionChanged()

// Notification
let notificationGenerator = UINotificationFeedbackGenerator()
notificationGenerator.notificationOccurred(.success)
notificationGenerator.notificationOccurred(.warning)
notificationGenerator.notificationOccurred(.error)

// Impact
let lightImpactGenerator = UIImpactFeedbackGenerator(style: .light)
lightImpactGenerator.impactOccurred()

let mediumImpactGenerator = UIImpactFeedbackGenerator(style: .medium)
mediumImpactGenerator.impactOccurred()

let heavyImpactGenerator = UIImpactFeedbackGenerator(style: .heavy)
heavyImpactGenerator.impactOccurred()
```

The above code generates 7 different haptic feedback patterns. The Notification Generator can be reused as the style is passed in with the trigger function, while the Impact Generator has the style directly associated with the generator. If you do reuse the generator you can call `prepare()` which will put it in an alert state to help execute the triggered pattern quicker. However you need to be careful as the Haptic Engine will only stay in a prepared state for a few seconds. And calling it right before the trigger action will not result in any improvements.  
For more custom patterns you can use `CoreHaptics` which provides you with a [`CHHapticEngine`](https://developer.apple.com/documentation/corehaptics/chhapticengine). 

## Summary
As developers we want to make our apps accessible to the widest audience possible. With the APIs and technologies covered above you can greatly improve the accessibility of your app. It may seem daunting especially if this is your first time getting to know these technologies. But starting to implement these APIs, even if just a few, will already open your app to a wider audience. And as you become more familiar with these technologies you'll be able to spot issue right away, and build new features for all.
