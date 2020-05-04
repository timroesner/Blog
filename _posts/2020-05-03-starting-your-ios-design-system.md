---
layout: post
title: "Starting your iOS Design System"
permalink: starting-ios-design-system
image: frame-system.jpeg
---

A Design System is a way to ensure that different screens of your app look consistent. This is very important if you have a big app with many screens, but even for smaller projects that are maintained over a long period, a Design System is useful especially when adding new features.

## Principles
These are the corner stones of your Design System. The constructs and details that ensure consistency. Your whole project depends on these, but they do not depend on your project, making it easy to separate these into their own framework, which can also be reused across multiple projects.

### Margins
Margins define the distances between your text, images, and other components. They can also be used to add padding. I prefer to make my margins multiples of 4, so that they can easily be combined:

```swift
public extension CGFloat {
	static let tightMargin: CGFloat = 2
	static let standardMargin: CGFloat = 8
	static let mediumMargin: CGFloat = 12
	static let wideMargin: CGFloat = 16
	static let extraWideMargin: CGFloat = 20
}

public extension UIEdgeInsets {
	init(uniform: CGFloat) {
		self.init(top: uniform, left: uniform, bottom: uniform, right: uniform)
	}
	
	static let tightMargin: UIEdgeInsets = .init(uniform: .tightMargin)
	static let standardMargin: UIEdgeInsets = .init(uniform: .standardMargin)
	static let mediumMargin: UIEdgeInsets = .init(uniform: .mediumMargin)
	static let wideMargin: UIEdgeInsets = .init(uniform: .wideMargin)
	static let extraWideMargin: UIEdgeInsets = .init(uniform: .extraWideMargin)
}
```

Having these extensions on `CGFloat` and `UIEdgeInsets` then allows you to use these with your programmatic constraints, and insets. Here is how the different values compare to each other:

![Margins Example](./assets/images/DesignSystem/Margins.jpeg)

### Text Styles
Every app contains some text, which makes styling text an important component of your app. Most likely you're using `San Francisco` the default iOS font within your app, and you probably encountered the [default text styles](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/#dynamic-type-sizes) that Apple offers. The great part about these are that they support Dynamic Type right out of the box, but I often found them to be too limiting. The following 12 text styles are the ones I regularly use, most of them come in a `Regular` and `Semibold` variant, making them versatile while still supporting Dynamic Type:

```swift
extension UIFont {
    static let titleExtraLarge: UIFont = font(ofSize: 34, weight: .semibold)
    
    static let titleLarge: UIFont = font(ofSize: 24, weight: .semibold)
    static let subtitleLarge: UIFont = font(ofSize: 24, weight: .regular)
    
    static let title: UIFont = font(ofSize: 18, weight: .semibold)
    static let subtitle: UIFont = font(ofSize: 18, weight: .regular) 
    
    static let headline: UIFont = font(ofSize: 16, weight: .semibold)
    static let body: UIFont = font(ofSize: 16, weight: .regular) 
    
    static let headlineSmall: UIFont = font(ofSize: 14, weight: .semibold)
    static let bodySmall: UIFont = font(ofSize: 14, weight: .regular)
    
    static let caption: UIFont = font(ofSize: 12, weight: .semibold)
    static let footnote: UIFont = font(ofSize: 12, weight: .regular)
    
    private static func font(ofSize size: CGFloat, weight: UIFont.Weight) -> UIFont {
        return fontMetrics(forSize: size).scaledFont(for: .systemFont(ofSize: size, weight: weight))
    }
    
   private static func fontMetrics(forSize size: CGFloat) -> UIFontMetrics {
        switch size {
        case 34: return UIFontMetrics(forTextStyle: .largeTitle)
        case 24: return UIFontMetrics(forTextStyle: .title2)
        case 18: return UIFontMetrics(forTextStyle: .title3)
        case 14, 16: return UIFontMetrics(forTextStyle: .body)
        case 12: return UIFontMetrics(forTextStyle: .footnote)
        default: return UIFontMetrics.default
        }
    }
}
```

Apple provides us with `UIFontMetrics` based on their preferred font styles, they are responsible for the scaling factor of the dynamic font sizes. Since we don't want all of them growing at the same rate we base them off the closest Apple equivalent.
Here is what all of these text styles looks like:

![Text Styles Example](./assets/images/DesignSystem/TextStyles.jpeg)  

### Colors

### Icons

### Elevation
Elevations refer to the shadow applied to a view to make it appear as if it is elevated from the page. Again we use an extension, this time on `UIView` and a custom enum type for our different levels, which also defines the offset, radius, and opacity for each:

```swift
public enum Elevation {
	case zero, one, two, three, four, five
	
	var offset: CGSize {
		switch self {
		case .zero: return .zero
		case .one: return CGSize(width: 0, height: 2)
		case .two: return CGSize(width: 0, height: 4)
		case .three: return CGSize(width: 0, height: 6)
		case .four: return CGSize(width: 0, height: 8)
		case .five: return CGSize(width: 0, height: 10)
		}
	}
	
	var radius: CGFloat {
		switch self {
		case .zero: return 0
		case .one: return 4
		case .two: return 6
		case .three: return 8
		case .four: return 10
		case .five: return 12
		}
	}
	
	var opacity: Float {
		switch self {
		case .zero: return 0
		case .one: return 0.1
		case .two: return 0.15
		case .three: return 0.15
		case .four: return 0.2
		case .five: return 0.2
		}
	}
}

public extension UIView {
	func setElevation(to elevation: Elevation) {
		layer.shadowOffset = elevation.offset
		layer.shadowRadius = elevation.radius
		layer.shadowOpacity = elevation.opacity
	}
}
```

We also define a type for level `.zero`, this can be useful when you want to clear any previously set elevation. Here is what these elevations look like in practice:

![Elevations Example](./assets/images/DesignSystem/Elevations.jpeg)

## Primitives
Primitives are patterns or views that can stand on their own and be reused for many different purposes. This might include subclasses of `UILabel`, `UITextField`, or `UIButton` which add additional functionality or styles that you reuse throughout your project. But this could also be your own custom components and patterns, which might include things like a Bottom Sheet, Tabs, or Banners.
These Primitives are often very unique to your project and depend on your needs, which is why I'm not including specific code examples. In order to decide if a view is a Primitive or just a simple view, it's best to ask you the following questions:
- Am I reusing this view in multiple places?
- Is it independent from project specific models?
If the answer to both of these is `Yes` then chances are it belongs within the Primitives of your Design System.
