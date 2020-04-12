---
layout: post
title: "Implementing UIPointerInteractions for iPadOS 13.4"
permalink: implementing-uipointerinteractions
image: highlighted-cursor.gif
---

With the release of iOS 13.4 the iPad got full mouse, trackpad and therefor also mouse pointer support. With the new Magic Keyboard accessory even more people will be using their iPad with Keyboard and Cursor, instead of touch inputs. In this post I will go over all the new APIs around pointer interactions, and point out some gotchas that will help you make your iPad app feel great when used with pointer input.

## UIButton
Buttons expose the main interaction within our apps. In order to have the cursor react accordingly it's as simple as setting the following property on `UIButton`:
```swift
button.isPointerInteractionEnabled = true
```

This will make the cursor morph and interact with your button by using the `.automatic` pointer effect. By implementing the following we can further customize the `UIPointerStyle`:

```swift
highlightedButton.pointerStyleProvider = { (button, effect, shape) in
    let targetedPreview = UITargetedPreview(view: button)
    return UIPointerStyle(effect: .highlight(targetedPreview))
}
```
There are four different Pointer Style effects: `.automatic, .highlight, .lift, .hover`. The guidance on when to use what is as following:

>- Use highlight for a small element that has a transparent background.  
>- Use lift for a small element that has an opaque background.  
>- Use hover for large elements and customize the scale, tint, and shadow attributes as needed.

In addition to the `targetedPreview` the `.hover` style also takes three more parameters (`preferredTintMode: TintMode, prefersShadow: Bool, prefersScaledContent: Bool`), which can be used to customize the appearance further. In the following illustration you can see all the different effects in action.

// GIF goes here

If you look closely you'll notice that the lift effect changes appearance depending on the size of the `targetedPreview`. This is in line with the guidance that Apple gave in their HIG around [Pointer Interactions](https://developer.apple.com/design/human-interface-guidelines/ios/user-interaction/pointers/). We'll also be looking at how to customize the shape of the pointer, but before we'll be looking at how to add these interactions to a subclass of `UIView`.

## UIView
Given a subclass of `UIView`, for example `UIImageView` we will need to add the following to enabled pointer interactions:
```swift
imageView.isUserInteractionEnabled = true
imageView.addPointerInteraction(with: self)
```

```swift
func addPointerInteraction(with pointerInteractionDelegate: UIPointerInteractionDelegate) {
    let pointerInteraction = UIPointerInteraction(delegate: pointerInteractionDelegate)
    self.addInteraction(pointerInteraction)
}
```

```swift
extension YourViewController: UIPointerInteractionDelegate {
    func pointerInteraction(_ interaction: UIPointerInteraction, styleFor region: UIPointerRegion) -> UIPointerStyle? {
        guard let view = interaction.view else { return nil }
        let targetedPreview = UITargetedPreview(view: view)
        return UIPointerStyle(effect: .lift(targetedPreview))
    }
}
```



## UIPointerShape

## UIContextMenu

## UIHoverGesture