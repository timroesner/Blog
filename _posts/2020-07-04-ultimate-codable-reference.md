---
layout: post
title: "Swift Codable Reference"
permalink: swift-codable-reference
image: binary-encoded.jpg
---

Codable is a protocol that has been introduced with Swift 4 and makes encoding and decoding data models to and from JSON significantly easier. In this reference I will discuss how to use it to decode different types of JSON, and what steps you can take if your data model and JSON don't perfectly line up.  

## JSON to Data Model
First let's look at decoding some JSON that matches our data model almost exactly:
```json
[
	{
		"title": "Gone Girl",
		"release_year": 2014,
		"dir": "David Fincher"
	},
	{
		"title": "The Social Network",
		"release_year": 2010,
		"dir": "David Fincher"
	}
]
```

```swift
struct Movie: Codable {
	let title: String
	let releaseYear: Int
	let director: String
	
	enum CodingKeys: String, CodingKey {
		case title
		case releaseYear
		case director = "dir"
	}
}
```

```swift
func decodeMovies(from jsonData: Data) -> [Movie] {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    do {
        return try decoder.decode([Movie].self, from: jsonData)
    } catch {
        print(error.localizedDescription)
        return []
    }
}
```

With the JSON given above we encounter two issues. First the use of snake case within the JSON and camel case within our own Swift struct. In order to solve this, we tell our JSON decoder to use the `.convertFromSnakeCase` decoding strategy.  
Second the JSON uses an abbreviation for the director key (`"dir"`). In order to solve this issue we add an enum `CodingKeys` to our data model, where we can define the string key used within the JSON, and our decoder will use this to automatically map between these keys.  
Furthermore we tell the decoder that we expect an array of movies, this works great if we have a flat data source.

## Nested JSON
With a nested JSON we often have to create helper structs that we can use to get to our data source, like so:
```json
{
	"response": {
		"status": 200,
		"date": 1593905049
	},
	"data": [
		{
			"title": "The Martian",
			"author": "Andy Weir",
			"release_year": 2011
		},
		{
			"title": "The Circle",
			"author": "Dave Eggers",
			"release_year": 2013
		}
	]
}
```

```swift
struct Book: Codable {
    let title: String
    let author: String
    let releaseYear: Int
}
```

```swift
private struct Root: Codable {
    let data: [Book]
}

func decodeBooks(from jsonData: Data) -> [Book] {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    do {
        let root = try decoder.decode(Root.self, from: jsonData)
        return root.data
    } catch {
        print(error.localizedDescription)
        return []
    }
}
```

In this example our data is nested within the JSON. Additionally we get some response data from the backend that we do not need for our model. We can safely ignore that and create a helper struct that only unwraps the books information from the nested data object. I declared the Root struct as private since it is only needed where ever we decode the JSON. Last but not least, we have a helper function that is able to return us the nested Book array given some JSON data, with the aid of the decodable Root struct.  
The above strategies are most likely enough to decode 90% of the JSON you work with, however sometimes we work with data types that do not have Codable support out of the box. For these cases we have to write our own decode functions.

## Custom Decoding
Next let's look at cases where we are dealing with data types that need a custom decoder implementation. We will also be using the strategies explained above:

```json
{
	"response": {
		"status": 200,
		"date": 1593905053
	},
	"stores": [
		{
			"name": "Apple Union Square",
			"website": "https://www.apple.com/retail/unionsquare/",
			"zip_code": 94108,
			"location": {
				"latitude": 37.7887,
				"longitude": -122.4072
			}
		},
		{
			"name": "Apple Fifth Avenue",
			"website": "https://www.apple.com/retail/fifthavenue/",
			"zip_code": 10153,
			"location": {
				"latitude": 40.7636,
				"longitude": -73.9727
			}
		}
	]
}
```

```swift
import CoreLocation

struct AppleStore {
    let name: String
    let website: URL?
    let zipCode: Int
    let location: CLLocation
}
```

```swift
private struct Root: Decodable {
    let appleStores: [AppleStore]
    
    enum CodingKeys: CodingKey {
        case stores
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let stores = try container.decode([StoreData].self, forKey: .stores)
        appleStores = stores.map { store in
            AppleStore(name: store.name, website: URL(string: store.website), zipCode: store.zipCode, 
            		   location: CLLocation(latitude: store.location.latitude, longitude: store.location.longitude))
        }
    }
}

private struct StoreData: Codable {
    let name: String
    let website: String
    let zipCode: Int
    let location: LocationData
}

private struct LocationData: Codable {
    let latitude: Double
    let longitude: Double
}

func decodeAppleStores(from jsonData: Data) -> [AppleStore] {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    do {
        let root = try decoder.decode(Root.self, from: jsonData)
        return root.appleStores
    } catch {
        print(error.localizedDescription)
        return []
    }
}
```

In this example we are using `CLLoaction` within our data model, which does not have Codable conformance out of the box. This means we need to provide a custom decoding strategy. Furthermore the location is nested within our JSON, but stored as a single property within our data model. These mismatches can be handle through implementing some helper struct, which I'm once again declaring `private` as they are only used to help with decoding.  
The main difference to the strategies above is the implementation of `init(from decoder: Decoder) throws` which is the method that is called by the `JSONDecoder`. Within it we first create a container based on the `CodingKeys` that we provided. As with all other Decodable implementations this does not need to be complete, but can be a subset of the keys we're actually using. Then we decode an array of our helper struct `StoreData`, which allows us to access the data with the types as it is present within the JSON. Finally we map over that array to generate our array of type `AppleStore`.  
These helper types and implementation of the `init(from decoder: Decoder)` function make it very pleasant to decode the JSON data at the call site. 

## Decoding Dates
In addition to a key decoding strategy `JSONDecoder` also allows us to set a custom `DateDecodingStrategy`. The following strategies are provided:
```swift
// Uses the default decoding strategy provided by the `Date` type
decoder.dateDecodingStrategy = .deferredToDate

decoder.dateDecodingStrategy = .iso8601  // "2020-07-10T02:08:32+00:00"

decoder.dateDecodingStrategy = .secondsSince1970  // 1593905134
decoder.dateDecodingStrategy = .millisecondsSince1970 // 1593905134175

decoder.dateDecodingStrategy = .formatted(DateFormatter)
decoder.dateDecodingStrategy = .custom((Decoder) -> Date)
```

## Summary
As you can see from the examples above, the `Decodable` protocol is very powerful and versatile when it comes to handling JSON. I hope this reference helped to better understand how to work with our own data types and make decoding a bliss. Additionally there are many online tools that generate the necessary Swift structs based on a JSON input provided by you.