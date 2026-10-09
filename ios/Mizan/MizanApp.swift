import SwiftUI

@main
struct MizanApp: App {
    var body: some Scene {
        WindowGroup {
            ShellView()
                .preferredColorScheme(.dark)
        }
    }
}
