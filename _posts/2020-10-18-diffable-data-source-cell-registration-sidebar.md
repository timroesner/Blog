---
layout: post
title: "DiffableDataSource with CellRegistration for iPad Sidebar"
permalink: diffable-data-source-cell-registration-sidebar
image: iPadFiles.jpg
---

With the release of iOS 13 we got new DiffableDataSource APIs that make CollectionViews more stable when it comes to updating and modifying data. Now with the introduction of iOS 14 we also got new CellRegistration APIs that take a closure based approach to dequeuing cells. In this post we will look at how we can leverage both of these new APIs by the example of creating a Sidebar for navigation on the iPad.  

Before we dive in, here is a GIF of the finished product so you have a better understanding of what we are setting out to do:  

![GIF of the finished sidebar implementation](./assets/images/Sidebar/Sidebar.gif)

## Compositional Layout
Let's start with looking at setting up our `SidebarViewController`, which is a subclass of `UICollectionViewController` and will make use of all these new APIs. First up is the Layout for the collectionView:   
```swift
init() {
	let layout = UICollectionViewCompositionalLayout { section, layoutEnvironment in
		var config = UICollectionLayoutListConfiguration(appearance: .sidebar)
		config.headerMode = section == 0 ? .none : .firstItemInSection
		return NSCollectionLayoutSection.list(using: config, layoutEnvironment: layoutEnvironment)
	}
	super.init(collectionViewLayout: layout)
	title = "Sidebar"
}
```

Here we are making use of the new `UICollectionViewCompositionalLayout`, which lets us specify a distinct layout for each section. In this case we're using that to set the `headerMode` as the first section does not have any header, but subsequent ones will make use of the `firstItemInSection`. This is the first step in making these sections collapsable.

## CellRegistration
With iOS 14 the `UICollectionViewDiffableDataSource` got a new closure based initializer that allows us to pass in CellRegistrations so that we can configure the content:  
```swift 
private lazy var dataSource = UICollectionViewDiffableDataSource<Section, CellItem>(collectionView: collectionView) { collectionView, indexPath, item in
	if item.isHeaderItem {
		let headerRegistration = UICollectionView.CellRegistration<UICollectionViewListCell, CellItem> { cell, indexPath, item in
			var configuration = cell.defaultContentConfiguration()
			configuration.text = item.title
			configuration.textProperties.font = .title
			cell.accessories = [.outlineDisclosure()]
			cell.contentConfiguration = configuration
		}
		return collectionView.dequeueConfiguredReusableCell(using: headerRegistration, for: indexPath, item: item)
	} else {
		let cellRegistration = UICollectionView.CellRegistration<UICollectionViewListCell, CellItem> { cell, indexPath, item in
			var configuration = cell.defaultContentConfiguration()
			configuration.text = item.title
			configuration.textProperties.font = .headline
			configuration.secondaryText = item.subtitle
			configuration.image = item.image
			configuration.imageProperties.maximumSize = CGSize(width: 44, height: 44)
			cell.contentConfiguration = configuration
		}
		return collectionView.dequeueConfiguredReusableCell(using: cellRegistration, for: indexPath, item: item)
	}
}
```

The `Section` and `CellItem` are custom types that conform to Hashable which then allows us to use these for the generic template types provided. The `item`, which we can access within the closure, is of type `CellItem` and has a boolean flag to let us know if it is a header item or a regular list item. We then use this to determine which configuration we apply to the cell.  
The `UICollectionView.CellRegistration` is another closure based API which, again, is generic in nature and we can pass our own types to it. Here I'm using the `UICollectionViewListCell` which is already included in UIKit, but if you need something more custom you can pass your own Cell class as long as it is a subclass of `UICollectionViewCell`.  
Interesting to note is the configuration approach, as it exposes only certain properties of the cell. This is made possible by the `UIListContentConfiguration` protocol. However it does not (yet) give access to all properties, for example the `outlineDisclosure` accessories has to be set directly on the cell. Furthermore don't forget to assign your finished configuration to the `contentConfigutation` of the cell.

## DiffableDataSource Snapshot
Now that we have our data source setup to configure our cells, we need to add some sections and items. We do that through a snapshot which is then applied to the data source, like so:
```swift
private var sections = [Section]() {
	didSet {
		applySnapshot()
	}
}

private func applySnapshot() {
	var snapshot = NSDiffableDataSourceSnapshot<Section, CellItem>()
	snapshot.appendSections(sections)
	
	for section in sections {
		guard let sectionTitle = section.localizedTitle else {
			snapshot.appendItems(section.items, toSection: section)
			dataSource.apply(snapshot)
			continue
		}
		var sectionSnapshot = NSDiffableDataSourceSectionSnapshot<CellItem>()
		let headerItem = CellItem(title: sectionTitle, subtitle: nil, image: nil, isHeaderItem: true)
		sectionSnapshot.append([headerItem])
		sectionSnapshot.append(section.items, to: headerItem)
		sectionSnapshot.expand([headerItem])
		dataSource.apply(sectionSnapshot, to: section)
	}
}
```
As you can see we create and apply a new snapshot every time our sections change. And, since we previously told our collectionView that we'll be using the first cell as a header item in certain sections, we need to create a header item and make use of the new `NSDiffableDataSourceSectionSnapshot`. First, we make sure that our section has a title. If it doesn't, we simply use the old way of applying the section items to the section directly. However, if we do have a title, we create a headerItem and a sectionSnapshot in which we apply the items to the headerItem directly. We also let the sectionSnapshot know that the headerItem can be used to expand (and collapse) the section. Finally we apply this new sectionSnapshot to our dataSource for the given section.

## SplitViewController
In order to get the reduced width Sidebar appearance seen above we need to embed the `SidebarViewController` in a `SplitViewController`, we do this in our `AppDelegate` or `SceneDelegate` depending on what you use:  
```swift
let splitView = UISplitViewController(style: .doubleColumn)
splitView.setViewController(SidebarViewController(), for: .primary)
// The initial ViewController for the secondary column is 
// set within the SidebarViewController
splitView.setViewController(tabBarController, for: .compact)
```
We're using a `doubleColumn` layout for this particular example, but the Sidebar works just as well with a `tripleColumn` style as well. Furthermore we also set a ViewController for the `compact` column which will be used in compact widths (iPhone, iPad multitasking). However important to note is that these are **two different view hierarchies**, Apple recommends to use state restoration so that users don't loose their place in the hierarchy when transitioning between regular and compact layout, as they do with iPad split screen.  
But if your app is rather large and you have not implemented state restoration, you can also use a container ViewController that switches between a SplitViewController and a TabBarController by listening to `traitCollectionDidChange`. This way you can reuse the same view hierarchy between both.  
  
Every ViewController has access to an optional `splitViewController` which is present if the ViewController is wrapped into one. We can make use of that in our SidebarController for changing the secondary ViewController when the user taps on of the topLevel navigation items as follows:
```swift
override func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
	let item = dataSource.itemIdentifier(for: indexPath)
	splitViewController?.setViewController(item?.viewController, for: .secondary)
}
```
The SplitViewController automatically wraps its children in a `UINavigationController`. However if you want these to behave the same way as in the TabBar, then you need to wrap them yourself in individual NavigationControllers. Otherwise, the splitViewController will just push the new ViewController on the existing navigation stack.

## Summary
I've really enjoyed diving deeper into these new CollectionView APIs, and they include much less boiler plate than the old Delegate based approach. I'm happy about a change in pace, especially when it comes to CollectionViews and TableViews which make up the majority of most iOS apps. However, I am also convinced that this new closure heavy approach is better as we don't have to deal with indices anymore which can go out of sync.
