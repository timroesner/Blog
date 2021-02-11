---
layout: post
title: "Understanding SwiftUI's View type"
permalink: swiftui-some-view-type
image: swiftui.png
---

With the introduction of Swift 5.1 and SwiftUI, new opaque return types were added to the language. Probably the most popular usage of this is the `some View` type, which is used for the `body` of SwiftUI View structs. 
In this article I'll cover the common pitfalls that we encounter as a result of this opaque type, where it can be use, and how we can get around its limitations.

## Properties
Most common throughout SwiftUI is the `body` property which makes use of this new `some View` type:
```swift
var body: some View {
	VStack {
		// Your layout
	}
}
```
This works without issues, as it is a computed property and contains only a single sub-type. But if you want to use this with a stored property, you run into the following issue:
```swift
// Property declares an opaque return type, but has no 
// initializer expression from which to infer an underlying type
var cell: some View
```
Since `View` is just a protocol to which many types adhere, one might think that we could just use it as our type here. However does not work as expected, as it has associated type requirements:
```swift
// Protocol 'View' can only be used as a generic constraint 
// because it has Self or associated type requirements
var cell: View
```
In order to solve the issue of type inference we either need to initialize it right then and there, or we can use a generic approach to infer the type at a later point:
```swift
struct SectionView<CellContent: View> {
	var cell: CellContent
}
```
Even though we can substitute any type that conforms to the `View` protocol for `CellContent`, once we do we are bound to that specific type. As illustrated in this code sample:
```swift
var section = SectionView(cell: Text("Lane"))
// Cannot assign value of type 'Image' to type 'Text'
section.cell = Image("firefly")
``` 
The same applies when we have more than one property of the `CellContent` type within our `SectionView`, since the compiler expects them to be of the same type. However we can define more than one generic `View` type:
```swift
struct Cell<Content, Accessory> where Content: View, Accessory: View {
	var content: Content
	var accessory: Accessory
}

let cell = Cell(content: Text("San Francisco"), accessory: Image(systemName: "cloud.fog"))
```  

## Functions
Just like computed properties we can use the `some View` type as a return type:
```swift
func cellContent(for item: Item) -> some View {
	VStack {
		// Your layout
	}
}
```
This works just like before, as it contains only a single sub-type, in this case the `VStack`, which conforms to the `View` protocol. However if we add any control statements we run into issues again:
```swift
// Function declares an opaque return type, but the return 
// statements in its body do not have matching underlying types
func cellContent(for item: Item) -> some View {
	if horizontalSizeClass == .compact {
		return VStack { ... }
	} else {
		return HStack { ... }
	}
}
```
We can solve this issue with the `@ViewBuilder` parameter attribute. As of Xcode 12.0 this attribute is automatically added to the `body` property of all SwiftUI View structs.
```swift
@ViewBuilder
func cellContent(for item: Item) -> some View {
	if horizontalSizeClass == .compact {
		VStack { ... }
	} else {
		HStack { ... }
	}
}
```
**Note:** In order for the ViewBuilder to work as intended we may not include `return`.

## Parameters
Similar to the stored property that we looked at before, parameters have similar limitations:
```swift
// 'some' types are only implemented for the declared type 
// of properties and subscripts and the return type of functions
func cell(with content: some View) -> Cell

// Protocol 'View' can only be used as a generic constraint 
// because it has Self or associated type requirements
func cell(with content: View) -> Cell
```
Just like before we can add a generic type, but this time we only need to apply it to the function:
```swift
func cell<Content: View>(with content: Content) -> Cell
```
As SwiftUI is heavily influenced by the closure syntax, we often have closure parameters that then produce an output of the `View` type. One could assume that since it's the return type of the closure we should be able to use `some View`? However like before we get an error:
```swift
// 'some' types are only implemented for the declared type 
// of properties and subscripts and the return type of functions
func cell(content: @escaping () -> some View) -> Cell
``` 
To solve this we can add the generic type to the function, and can also apply the `@ViewBuilder` attribute if the content should support control statements:
```swift
func cell<Content: View>(@ViewBuilder content: @escaping () -> Content) -> Cell
```
The same syntax can also be used for parameters within initializers.

## Summary
Opaque return types are a great tool to get around limitations of the associated type requirements of the `View` protocol. However we just saw, they come with their own limitations. Fortunately Swift already provides us with great tools to combat these. 

