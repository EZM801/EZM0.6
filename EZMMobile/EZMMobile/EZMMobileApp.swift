import SwiftUI

@main
struct EZMMobileApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var apiService = APIService()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(apiService)
        }
    }
} 