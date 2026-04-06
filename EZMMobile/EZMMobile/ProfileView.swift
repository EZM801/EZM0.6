import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showingEditProfile = false
    @State private var showingSettings = false
    @State private var showingLogoutAlert = false
    @State private var showingDeleteAccountAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Profile Header
                    profileHeaderSection
                    
                    // Account Information
                    accountInfoSection
                    
                    // Quick Actions
                    quickActionsSection
                    
                    // Account Statistics
                    accountStatsSection
                    
                    // Settings
                    settingsSection
                    
                    // Logout Section
                    logoutSection
                }
                .padding()
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Edit") {
                        showingEditProfile = true
                    }
                }
            }
            .sheet(isPresented: $showingEditProfile) {
                EditProfileView()
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
            .alert("Logout", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Logout", role: .destructive) {
                    authManager.logout()
                }
            } message: {
                Text("Are you sure you want to logout?")
            }
            .alert("Delete Account", isPresented: $showingDeleteAccountAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    // Implement account deletion
                }
            } message: {
                Text("This action cannot be undone. All your data will be permanently deleted.")
            }
        }
    }
    
    // MARK: - Profile Header Section
    private var profileHeaderSection: some View {
        VStack(spacing: 20) {
            // Profile Picture
            Circle()
                .fill(Color.blue.opacity(0.1))
                .frame(width: 100, height: 100)
                .overlay(
                    Text(String(authManager.userFullName.prefix(1)))
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                )
            
            // User Info
            VStack(spacing: 8) {
                Text(authManager.userFullName)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(authManager.userEmail)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if !authManager.userPhone.isEmpty {
                    Text(authManager.userPhone)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Account Type Badge
                HStack(spacing: 8) {
                    AccountTypeBadge(type: authManager.currentUser?.accountType ?? "individual")
                    
                    if authManager.isEmailVerified {
                        VerificationBadge(type: "Email")
                    }
                    
                    if authManager.isAccountVerified {
                        VerificationBadge(type: "Account")
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Account Information Section
    private var accountInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Account Information")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                InfoRow(
                    icon: "person.fill",
                    title: "Account Type",
                    value: authManager.currentUser?.accountType.capitalized ?? "Individual",
                    color: .blue
                )
                
                if let role = authManager.userRole {
                    InfoRow(
                        icon: "badge.fill",
                        title: "Role",
                        value: role.capitalized,
                        color: .purple
                    )
                }
                
                if let companyCode = authManager.companyCode {
                    InfoRow(
                        icon: "building.2.fill",
                        title: "Company Code",
                        value: companyCode,
                        color: .green
                    )
                }
                
                if let lastLogin = authManager.lastLoginDate {
                    InfoRow(
                        icon: "clock.fill",
                        title: "Last Login",
                        value: formatDate(lastLogin),
                        color: .orange
                    )
                }
                
                if let accountAge = authManager.accountAgeInDays {
                    InfoRow(
                        icon: "calendar",
                        title: "Account Age",
                        value: "\(accountAge) days",
                        color: .teal
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Quick Actions Section
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                QuickActionCard(
                    title: "Edit Profile",
                    icon: "person.circle",
                    color: .blue
                ) {
                    showingEditProfile = true
                }
                
                QuickActionCard(
                    title: "Settings",
                    icon: "gear",
                    color: .gray
                ) {
                    showingSettings = true
                }
                
                QuickActionCard(
                    title: "Change Password",
                    icon: "lock.circle",
                    color: .orange
                ) {
                    // Navigate to change password
                }
                
                QuickActionCard(
                    title: "Help & Support",
                    icon: "questionmark.circle",
                    color: .green
                ) {
                    // Navigate to help
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Account Statistics Section
    private var accountStatsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Account Statistics")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                StatCard(
                    title: "Total Moves",
                    value: "0", // This would come from API
                    icon: "truck.box.fill",
                    color: .blue
                )
                
                StatCard(
                    title: "Active Moves",
                    value: "0", // This would come from API
                    icon: "play.circle.fill",
                    color: .green
                )
                
                StatCard(
                    title: "Completed Moves",
                    value: "0", // This would come from API
                    icon: "checkmark.circle.fill",
                    color: .purple
                )
                
                StatCard(
                    title: "Total Items",
                    value: "0", // This would come from API
                    icon: "cube.box.fill",
                    color: .orange
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Settings Section
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Settings")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 0) {
                SettingsRow(
                    icon: "bell",
                    title: "Notifications",
                    subtitle: "Manage notification preferences",
                    color: .blue
                ) {
                    // Navigate to notifications
                }
                
                Divider()
                    .padding(.leading, 50)
                
                SettingsRow(
                    icon: "eye",
                    title: "Privacy",
                    subtitle: "Control your privacy settings",
                    color: .green
                ) {
                    // Navigate to privacy
                }
                
                Divider()
                    .padding(.leading, 50)
                
                SettingsRow(
                    icon: "shield",
                    title: "Security",
                    subtitle: "Manage security settings",
                    color: .orange
                ) {
                    // Navigate to security
                }
                
                Divider()
                    .padding(.leading, 50)
                
                SettingsRow(
                    icon: "doc.text",
                    title: "Terms & Privacy",
                    subtitle: "Read our terms and privacy policy",
                    color: .purple
                ) {
                    // Navigate to terms
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Logout Section
    private var logoutSection: some View {
        VStack(spacing: 12) {
            Button(action: {
                showingLogoutAlert = true
            }) {
                HStack {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .foregroundColor(.red)
                    
                    Text("Logout")
                        .fontWeight(.medium)
                        .foregroundColor(.red)
                    
                    Spacer()
                }
                .padding()
                .background(Color.red.opacity(0.1))
                .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
            
            Button(action: {
                showingDeleteAccountAlert = true
            }) {
                HStack {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                    
                    Text("Delete Account")
                        .fontWeight(.medium)
                        .foregroundColor(.red)
                    
                    Spacer()
                }
                .padding()
                .background(Color.red.opacity(0.1))
                .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Supporting Views
struct AccountTypeBadge: View {
    let type: String
    
    var body: some View {
        Text(type.capitalized)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(type == "company" ? Color.green : Color.blue)
            .cornerRadius(8)
    }
}

struct VerificationBadge: View {
    let type: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.seal.fill")
                .font(.caption)
            
            Text(type)
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundColor(.green)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(Color.green.opacity(0.1))
        .cornerRadius(6)
    }
}

struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .frame(width: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Edit Profile View
struct EditProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phoneNumber = ""
    @State private var isLoading = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Personal Information") {
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                    TextField("Phone Number", text: $phoneNumber)
                        .keyboardType(.phonePad)
                }
                
                Section {
                    Button(action: saveProfile) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                    .scaleEffect(0.8)
                            } else {
                                Text("Save Changes")
                                    .fontWeight(.medium)
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(isLoading || !isFormValid)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveProfile()
                    }
                    .disabled(isLoading || !isFormValid)
                }
            }
            .onAppear {
                loadCurrentProfile()
            }
            .alert("Profile Update", isPresented: $showingAlert) {
                Button("OK") {
                    if !alertMessage.contains("Error") {
                        dismiss()
                    }
                }
            } message: {
                Text(alertMessage)
            }
        }
    }
    
    private var isFormValid: Bool {
        !firstName.isEmpty && !lastName.isEmpty
    }
    
    private func loadCurrentProfile() {
        firstName = authManager.currentUser?.firstName ?? ""
        lastName = authManager.currentUser?.lastName ?? ""
        phoneNumber = authManager.currentUser?.phoneNumber ?? ""
    }
    
    private func saveProfile() {
        isLoading = true
        
        authManager.updateProfile(
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber
        )
        
        // Handle the result
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isLoading = false
            alertMessage = "Profile updated successfully!"
            showingAlert = true
        }
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var notificationsEnabled = true
    @State private var biometricAuthEnabled = false
    @State private var autoLoginEnabled = false
    @State private var darkModeEnabled = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Notifications") {
                    Toggle("Push Notifications", isOn: $notificationsEnabled)
                    Toggle("Email Notifications", isOn: $notificationsEnabled)
                }
                
                Section("Security") {
                    Toggle("Biometric Authentication", isOn: $biometricAuthEnabled)
                    Toggle("Auto Login", isOn: $autoLoginEnabled)
                }
                
                Section("Appearance") {
                    Toggle("Dark Mode", isOn: $darkModeEnabled)
                }
                
                Section("Data & Privacy") {
                    Button("Export Data") {
                        // Implement data export
                    }
                    
                    Button("Delete All Data") {
                        // Implement data deletion
                    }
                    .foregroundColor(.red)
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Button("Terms of Service") {
                        // Navigate to terms
                    }
                    
                    Button("Privacy Policy") {
                        // Navigate to privacy policy
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager())
} 