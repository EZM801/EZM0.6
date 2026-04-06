import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var isSignup = false
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var accountType = "individual"
    @State private var companyCode = ""
    @State private var showPassword = false
    @State private var rememberMe = false
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "truck.box.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("EZM Mobile")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text("Moving Made Easy")
                            .font(.title3)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 50)
                    
                    // Form
                    VStack(spacing: 20) {
                        if isSignup {
                            // Signup Form
                            VStack(spacing: 16) {
                                HStack(spacing: 12) {
                                    CustomTextField(
                                        text: $firstName,
                                        placeholder: "First Name",
                                        icon: "person"
                                    )
                                    
                                    CustomTextField(
                                        text: $lastName,
                                        placeholder: "Last Name",
                                        icon: "person"
                                    )
                                }
                                
                                CustomTextField(
                                    text: $email,
                                    placeholder: "Email",
                                    icon: "envelope"
                                )
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                
                                CustomSecureField(
                                    text: $password,
                                    placeholder: "Password",
                                    showPassword: $showPassword
                                )
                                
                                // Account Type Selection
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Account Type")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    
                                    Picker("Account Type", selection: $accountType) {
                                        Text("Individual").tag("individual")
                                        Text("Company").tag("company")
                                    }
                                    .pickerStyle(SegmentedPickerStyle())
                                }
                                
                                if accountType == "company" {
                                    CustomTextField(
                                        text: $companyCode,
                                        placeholder: "Company Code",
                                        icon: "building.2"
                                    )
                                }
                            }
                        } else {
                            // Login Form
                            VStack(spacing: 16) {
                                CustomTextField(
                                    text: $email,
                                    placeholder: "Email",
                                    icon: "envelope"
                                )
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                
                                CustomSecureField(
                                    text: $password,
                                    placeholder: "Password",
                                    showPassword: $showPassword
                                )
                                
                                HStack {
                                    Toggle("Remember Me", isOn: $rememberMe)
                                        .font(.caption)
                                        .toggleStyle(SwitchToggleStyle(tint: .blue))
                                    
                                    Spacer()
                                    
                                    Button("Forgot Password?") {
                                        // Handle forgot password
                                        alertMessage = "Password reset functionality coming soon!"
                                        showAlert = true
                                    }
                                    .font(.caption)
                                    .foregroundColor(.blue)
                                }
                            }
                        }
                        
                        // Action Button
                        Button(action: handleAction) {
                            HStack {
                                if authManager.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                } else {
                                    Text(isSignup ? "Create Account" : "Sign In")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(authManager.isLoading || !isFormValid)
                        .opacity(isFormValid ? 1.0 : 0.6)
                        
                        // Toggle between login and signup
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.3)) {
                                isSignup.toggle()
                                clearForm()
                            }
                        }) {
                            Text(isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.horizontal, 24)
                    
                    Spacer()
                }
            }
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue.opacity(0.1), Color.clear]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .navigationBarHidden(true)
        }
        .alert("Notice", isPresented: $showAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
        .onReceive(authManager.$errorMessage) { errorMessage in
            if let error = errorMessage {
                alertMessage = error
                showAlert = true
                authManager.clearError()
            }
        }
    }
    
    private var isFormValid: Bool {
        if isSignup {
            return !email.isEmpty && 
                   !password.isEmpty && 
                   !firstName.isEmpty && 
                   !lastName.isEmpty &&
                   (accountType != "company" || !companyCode.isEmpty) &&
                   authManager.validateEmail(email) &&
                   authManager.validatePassword(password)
        } else {
            return !email.isEmpty && !password.isEmpty
        }
    }
    
    private func handleAction() {
        if isSignup {
            authManager.signup(
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                accountType: accountType,
                companyCode: accountType == "company" ? companyCode : nil
            )
        } else {
            authManager.login(email: email, password: password)
        }
    }
    
    private func clearForm() {
        email = ""
        password = ""
        firstName = ""
        lastName = ""
        accountType = "individual"
        companyCode = ""
        showPassword = false
        rememberMe = false
    }
}

// MARK: - Custom Components
struct CustomTextField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.secondary)
                .frame(width: 20)
            
            TextField(placeholder, text: $text)
                .textFieldStyle(PlainTextFieldStyle())
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
    }
}

struct CustomSecureField: View {
    @Binding var text: String
    let placeholder: String
    @Binding var showPassword: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock")
                .foregroundColor(.secondary)
                .frame(width: 20)
            
            if showPassword {
                TextField(placeholder, text: $text)
                    .textFieldStyle(PlainTextFieldStyle())
            } else {
                SecureField(placeholder, text: $text)
                    .textFieldStyle(PlainTextFieldStyle())
            }
            
            Button(action: {
                showPassword.toggle()
            }) {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
    }
}

// MARK: - Preview
#Preview {
    LoginView()
        .environmentObject(AuthManager())
} 