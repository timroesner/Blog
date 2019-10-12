---
layout: post
title: "Swift: Using SF Symbols"
permalink: using-sf-symbols
image: icons.jpg
---

Xcode 11 is now publicly available and with it come over 1500 unique symbols, designed by Apple. These are available as part of an updated version of the SF Pro and SF Compact fonts. 

To explore all icons and find the right one, I highly recommend using the [SF Symbols App](https://developer.apple.com/design/downloads/SF-Symbols.dmg) from Apple. Below you can see a screenshot of it:
![SF Symbols App](./assets/images/SFSymbolsApp.png)

## Usage
Once you picked the string identifier, it's time to add the symbol to your Swift project. UIKit introduced a new UIImage initializer that helps us with this: 
```swift
let shareIcon = UIImage(systemName: "square.and.arrow.up")
```
This works perfectly fine, but you'll soon notice that icons are always a specific size and weight. If you've played around with the app mentioned above, you probably saw that these symbols are available in multiple variations. In order to get a different size or weight we have to create a SymbolConfiguration and pass it as parameter when we initialize our UIImage:
```swift
let config = UIImage.SymbolConfiguration(pointSize: 24, weight: .semibold)
let shareIcon = UIImage(systemName: "square.and.arrow.up", withConfiguration: config)

let imageView = UIImageView(image: shareIcon)
imageView.tintColor = .systemBlue
```
There are multiple initializers available for the SymbolConfiguration, so I encourage you to use the one fitting for your needs.

If you used these new methods in a project that does not target iOS 13+ you might have noticed, that the compiler will throw an error telling you that they are only available starting with iOS 13. 


## iOS 12 and below
Since SF Symbols are embedded into the system font, they can be used on any device, that has the latest version of the font installed. iOS 12 unfortunately has very poor font management, and even on Mojave or earlier you will occasionally see "�" instead of your symbol.

When you install the SF Symbols app it will automatically install the needed fonts as well, which means you can use them in your favorite design tools, like Photoshop, Sketch, Figma, etc.

I started using these new Symbols in an app that supports iOS 12 and below. I achieved this by copying the symbol and embedding it into a text layer in a Sketch Artboard. I then exported it as a PDF to Xcode and can use it like any other image asset. Make sure to check the `Use as template` box, so it automatically adjust to the tintColor.
This method also allowed me to adjust the size, color, and weight as needed.

Here is a screenshot of the same icon that I created above in code, as Sketch Artboard:
![Sketch SF Symbols](./assets/images/SketchSFSymbols.png)

## Further Convenience 

As you can see above, the convinience initializer takes the string of the symbol, which can be both error prone and sometimes does not resemble the use case of the symbol. The best way to improve this, is to create more descriptive enum cases, that use the symbol name as rawValue. You can see an example of a wrapper like this below:

```swift
extension UIImage {
    convenience init?(symbol: SymbolName, configuration: UIImage.SymbolConfiguration? = nil) {
        self.init(systemName: symbol.rawValue, withConfiguration: configuration)
    }
}

enum SymbolName: String {
    case share = "square.and.arrow.up"
    case more = "ellipsis.circle"
    case moreFilled = "ellipsis.circle.fill"
    case trash = "trash"
}
```

This is just a small subset of the over 1600 symbols. You will likely not use all of them in your project, so adding them while you go along is probably your best bet.  

### Summary
Looking for icons to use in your project has always been a struggle for indie developers. It's great that we now get so many Apple designed resources to use, scalabled to many sizes and weights. No more paying fees or worrying about seperate licenses for your icons. 
Unfortunatly the overhead for adding icons to iOS 12 and below is much larger than for iOS 13. It might be a little while longer before most projects will target iOS 13, but once they do, it opens up a lot more possibilities.
