---
layout: post
title: "Swift: Accessing metadata from AVAsset"
permalink: metadata-from-avasset
image: "popcorn.jpeg"
---

Most assets like movies, music and TV shows from the iTunes Store come with a lot of metadata like artwork, release date, length etc. Or if you're like me and add this data to your own files with a tool like [Subler](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=2ahUKEwiXpMWS4JvdAhWHCDQIHa8VCF0QFjAAegQICRAB&url=https%3A%2F%2Fsubler.org%2F&usg=AOvVaw09odXAxlUbLRCMCmOdxzBM). 
With the help of AVFoundation you are able to access this data in your iOS and macOS apps, but it's not as straight forward and the documentation very sparse, which is why this post will help you master all this. 

## Prerequisites
- Have a media file with metadata in your project
- import `AVFoundation`
- Create an AVAsset from your file

## 1.
Fetch the metadata from your asset like this:
```swift
let metadata = asset.metadata(forFormat: AVMetadataFormatiTunesMetadata)
```

## 2. 
Access the desired field with `keySpace` and `key`
I've noticed that Apple does not have much documentation on the keys they use and these might change, but here is a list:

### keySpace: 'itsk'
- Name: '©nam'
- Artwork: 'covr'
- Artist: '©ART'
- Writer: '©wrt'
- Description: 'desc'
- Long Description: 'ldes'
- Genres: '©gen'
- Release date: '©day'
- Executive Producers: '©xpd'
- HD: 'hdvd'
    - 0: No
    - 1: 720p
    - 2: 1080p
- Media type: 'stik'
    - 9: Movie

### keySpace: 'itlk'
- Age rating: 'com.apple.iTunes.iTunEXTC'
- Cast, Directors, Screenwriters, and Studio (.plist):  'com.apple.iTunes.iTunMOVI'

## 3. 
Extract the metadata field you like: 
**Note**: *Most of these are stored as strings*
```swift
let titleItems = AVMetadataItem.metadataItems(from: metadata, withKey: "©nam", keySpace: "itsk")
if let data = titleItems.first, let title = data.stringValue {
    print(title)
}
```
    
## 3.1
The iTunMOVI field is a little harder, as it is a .plist which you first have to serialize. Here is an example of how to obtain these fields:
```swift
let extendedInfo = AVMetadataItem.metadataItems(from: metadata, withKey: "com.apple.iTunes.iTunMOVI", keySpace: "itlk")
if let first = extendedInfo.first {
    do {
        let plistData = try PropertyListSerialization.propertyList(
            from: first.stringValue?.data(using: .utf8) ?? Data(), 
            options: .mutableContainersAndLeaves, format: nil
        ) as! [String:AnyObject]

        print(plistData["cast"].map({$0.value(forKey: "name")}) as? [String] ?? [])
        print(plistData["directors"].map({$0.value(forKey: "name")}) as? [String] ?? [])
        print(plistData["screenwriters"].map({$0.value(forKey: "name")}) as? [String] ?? [])

    } catch {
        print("Error reading plist: \(error.localizedDescription)")
    }
}
```


## Summary
I'm glad Apple offers a way to access this data on iOS, even though it is not quite intuitive. I hope this little guide helped you to get around some of the obstacles. 