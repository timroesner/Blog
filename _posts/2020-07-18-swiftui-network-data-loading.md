---
layout: post
title: "Loading Network Data in SwiftUI"
permalink: swiftui-network-data-loading
image: network-switch.jpg
---

With WWDC20 behind us, and new additions to SwiftUI, many developers are now looking more closely at writing apps with the new framework. In this post I want to discuss how we can setup a pipeline to request data from a network server, and then display it within a SwiftUI view. If you haven't worked with Combine before, it will also introduce you to Publishers which we will use for the network request.

## Data Loader
First we will leverage `URLSession` and the new Publisher API to load and transform data from the network. Here I've written a simple function to request JSON from a URL:

```swift
import Combine

enum DataLoader {
	static func loadStores(from url: URL) -> AnyPublisher<[AppleStore], Error> {
		URLSession.shared.dataTaskPublisher(for: url)
			.receive(on: RunLoop.main)
			.map({ $0.data })
			.decode(type: AppleStore.self, decoder: JSONDecoder())
			.eraseToAnyPublisher()
	}
}
```

I personally love how easy Combine makes it to create a pipeline to transform your raw data into what you need. So let's look at what's going on step by step:
1. We request data from a URL, in case you need to provide a header or body you can also use a `URLRequest`.
2. We make sure we are on `RunLoop.main` this is important if we want to perform UI updates with the result.
3. We unpack the data from the response. In case it is `nil` the pipeline will stop and a failure is reported.
4. We decode our JSON data with the help of `Codable`. If you need more information on that you can check out my [last post](/swift-decode-json-codable).
5. Finally we convert this pipeline to `AnyPublisher` which flattens the types and makes our result type easily accessible.

## Data Manager
Next we have a DataManager, which acts as source of truth for our SwiftUI View and is an `ObservableObject`:

```swift
import Combine

class DataManager: ObservableObject {
	@Published
	private(set) var appleStores = [AppleStore]()
	
	private var token: Cancellable?
	
	func loadStores() {
		token?.cancel()
		
		let url = URL(string: "https://timroesner.com/workshops/applestores.json")!
		token = DataLoader.loadStores(from: url)
			.sink { completion in
				if case .failure(let error) = completion {
					print(error.localizedDescription)
				}
			} receiveValue: { [weak self] result in
				self?.appleStores = result
			}
	}
}
```

Let's step through what this class will accomplish for us. First we make this class an `ObservableObject`, this will allow us to define it as a `@StateObject` within SwiftUI, more on that later.  
 Then we declare the appleStore property as `@Published`, this is very important, as otherwise SwiftUI will not update its View Hierarchy when the contents of the array change.  
Next we have a `Cancellable` token, this needs to be stored at the class level in order to hold onto our request and make sure it doesn't go away before the request is finished. This is true for any Combine Publisher.  
Within our `loadStores` function we first cancel any unfinished requests, this is in case the user requests to load multiple times. We also define the URL from which we will be loading our data, and last we start observing our Publisher, and `sink` once the request completes and when we receive a value. Here we also do error handling and assign the result to our array of appleStores when the request was successful.

## SwiftUI View
Last but certainly not least we need to setup our SwiftUI view to display and request the data from our `DataManager`:

```swift
struct ListView: View {
	@StateObject var dataManager = DataManager()
	
	var body: some View {
		List(dataManager.appleStores) { store in
			Text(store.name)
		}.onAppear {
			dataManager.loadStores()
		}
	}
}
```

We've already done most of our work, so displaying and requesting the data within this SwiftUI view is very concise, thanks to our `DataManger` which is doing the heavy lifting. Again let's look at what is going on in detail: First we create an instance of our `DataManager` and mark this property with `@StateObject`, this tells SwiftUI to observe updates from this object. Furthermore it allows us to retain this property even after SwiftUI is done rendering the view. This is very important as we don't store the property anywhere else, and it would otherwise be released.  
Within our body we then list out the names of all the stores we get from the `DataManager`, this will be recreated once new data is published. And finally we use the SwiftUI `onAppear` handler to start loading our stores from the network. This will happen when the view first appears, the user comes back from the background, or we navigate back to this view through a NavigationView. Additionally we could implement a "Refresh" button to allow the user to trigger a manual refresh, however Apple Store data doesn't change that frequently, so it is left out of the example.

## Summary
Leveraging the power of Combine, paired with SwiftUI's state management, we are able to separate view, data, and networking into completely separate components. I'm really enjoying how all these pieces come together and build this architecture that has a single source of truth and can still be reused and injected into subsequent views.