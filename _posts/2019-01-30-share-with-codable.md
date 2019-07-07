---
layout: post
title: "Swift: Share Codable data through UIActivityViewController"
permalink: sharing-with-codable
image: "share.jpeg"
---

Many users want to be able to share content with others over AirDrop, Messages, Email, or etc. UIActivityViewController offers a simple way to share things between devices. Your app will then be able to import these files. If the user receiving this file does not have your app yet, you can prompt him to download it.<br>
In this post I will walk you through the steps that are needed to implement this feature. We will be using the powers of the Codable protocol, which makes exporting and importing super simple.<br>
So let's assume we have a note taking app and would like to share notes between devices. 
<br>
### Step 1
First we need to let the system know that our app can read certain file extensions. To do so add the following fields to your Info.plist:
![Screen-Shot-2019-01-28-at-5.04.07-PM](/assets/images/file-extension-screenshot.png)
<br>
### Step 2
Let's look at what we would like to send, for this example I want to send a simple note from my Note taking app. This is what the struct looks like, this also works with classes as long as they conform to the Codable protocol.
```swift
struct Note: Codable {
    var id: String
    var text: String
    var lastEdited: Date
}
```
Note: Make sure all your sub-types also conform to Codable otherwise you will get errors<br>
Next we will need to convert our struct into a dictionary. For that we will extend the Codable protocol with a useful function that will make this easy for any type that conforms to the protocol:
```swift
extension Encodable {
    func asDictionary() throws -> [String: Any] {
        let data = try JSONEncoder().encode(self)
        guard let dictionary = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any] else {
            throw NSError()
        }
        return dictionary
    }
}
```
<br>

### Step 3
Now we are ready to export our struct and send it somewhere using UIActivityViewController. To achive that we will convert our note into a document with the ".note" file extension, write it to memory and return the URL to the file we just created:
```swift
func exportToFileURL(note: Note) -> URL? {
    guard let contents = try? note.asDictionary() else {
        return nil
    }
    
    guard let path = FileManager.default
        .urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
    }
    
    let saveFileURL = path.appendingPathComponent("/\(note.id).note")
    (contents as NSDictionary).write(to: saveFileURL, atomically: true)
    return saveFileURL
}
```
Note that when you send the file the receiver will be able to see the name, so choose something that is humanly readable and doesn't look suspicious. 
<br>
### Step 4
Now we can present the UIActivityViewController with the function we just wrote. It's best to do so from a share button as it is universally used across iOS: 
```swift 
@IBAction func share() {
    guard let url = exportToFileURL(note: currentNote) else {
            return
    }

    let activityViewController = UIActivityViewController(
        activityItems: ["You can add some text or other items here", url],
        applicationActivities: nil)
    present(activityViewController, animated: true, completion: nil)
}
```
Make sure everything works and AirDrop or email the file to yourself. With a text editor you will be able to inspect the contents and see if everything got written to the file.
<br>
### Step 5
Now it is time to import the file. The system already knows we can read these file types, but currently nothing is happening when we open a file with our app. So let's change that:
```swift
func importData(from url: URL) -> Note? {
    guard let dictionary = NSDictionary(contentsOf: url),
        let noteInfo = dictionary as? [String: Any],
        let data = try? JSONSerialization.data(withJSONObject: noteInfo, options: .prettyPrinted),
        let note = try? JSONDecoder().decode(Note.self, from: data)
    else {
            return nil
    }
    
    // Add the new note to your persistent storage here
    
    do {
        try FileManager.default.removeItem(at: url)
    } catch {
        print("Failed to remove item from Inbox")
    }
    return note
}
```
<br>

### Step 6 
The last step is to make use of this function when the app is opening the sent file. To do that we need to add the following into our AppDelegate:
```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
    if url.pathExtension == "note" {
        let importedNote = importData(from: url)

        guard let note = importedNote else { return true }
        
        // Present the imported note to the user
    }
    return true
}
```

<br>

## Summary 
Thanks to Codable it has gotten a lot easier to encode and decode custom types. Sharing is a great way to spread content and also drive adoption of your app.
