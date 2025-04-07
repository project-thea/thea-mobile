# thea-work-manager

## Why?
I want to make sure that the locations can be updated to the server even when the app is sent to the background/not running.

Setting up expo's `expo-task-manager` is a pain. For starters, it seems to require `Expo SDK 52` which comes with a tonne of breaking changes. Creating a custom module seems like the easier option in this case

## How?
Use Android's `WorkManager` APIs to create a native module

## Progress
:(