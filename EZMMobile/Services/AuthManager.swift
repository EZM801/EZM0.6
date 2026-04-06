import Foundation
import Combine

class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private let apiService: APIService
    
    init() {
        self.apiService = APIService()
        checkAuthenticationStatus()
    }
    
    // MARK: - Authentication Status
    private func checkAuthenticationStatus() {
        if let token = UserDefaults.standard.string(forKey: "authToken"), !token.isEmpty {
            isAuthenticated = true
            loadUserProfile()
        } else {
            isAuthenticated = false
            currentUser = nil
        }
    }
    
    // MARK: - Login
    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleSuccessfulAuth(user: response.user, token: response.token)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Signup
    func signup(email: String, password: String, firstName: String?, lastName: String?, accountType: String, companyCode: String?) {
        isLoading = true
        errorMessage = nil
        
        apiService.signup(email: email, password: password, firstName: firstName, lastName: lastName, accountType: accountType, companyCode: companyCode)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleSuccessfulAuth(user: response.user, token: response.token)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Logout
    func logout() {
        isLoading = true
        
        apiService.logout()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    self?.clearAuthData()
                },
                receiveValue: { [weak self] _ in
                    self?.clearAuthData()
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Load User Profile
    private func loadUserProfile() {
        apiService.getUserProfile()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("Failed to load user profile: \(error)")
                        // Don't clear auth data on profile load failure
                    }
                },
                receiveValue: { [weak self] user in
                    self?.currentUser = user
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Update User Profile
    func updateProfile(firstName: String?, lastName: String?, phoneNumber: String?) {
        isLoading = true
        errorMessage = nil
        
        apiService.updateUserProfile(firstName: firstName, lastName: lastName, phoneNumber: phoneNumber)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] user in
                    self?.currentUser = user
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Helper Methods
    private func handleSuccessfulAuth(user: User, token: String) {
        UserDefaults.standard.set(token, forKey: "authToken")
        UserDefaults.standard.set(user.id, forKey: "userId")
        UserDefaults.standard.set(user.email, forKey: "userEmail")
        
        currentUser = user
        isAuthenticated = true
        isLoading = false
        errorMessage = nil
    }
    
    private func clearAuthData() {
        UserDefaults.standard.removeObject(forKey: "authToken")
        UserDefaults.standard.removeObject(forKey: "userId")
        UserDefaults.standard.removeObject(forKey: "userEmail")
        
        currentUser = nil
        isAuthenticated = false
        isLoading = false
        errorMessage = nil
    }
    
    // MARK: - Validation
    func validateEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    func validatePassword(_ password: String) -> Bool {
        return password.count >= 8
    }
    
    // MARK: - Account Type Helper
    var isCompanyAccount: Bool {
        return currentUser?.accountType == "company"
    }
    
    var isIndividualAccount: Bool {
        return currentUser?.accountType == "individual"
    }
    
    // MARK: - User Role Helper
    var userRole: String? {
        return currentUser?.role
    }
    
    var isAdmin: Bool {
        return userRole == "admin"
    }
    
    var isForeman: Bool {
        return userRole == "foreman"
    }
    
    var isEmployee: Bool {
        return userRole == "employee"
    }
    
    // MARK: - Company Info
    var companyId: String? {
        return currentUser?.companyId
    }
    
    var companyCode: String? {
        return currentUser?.companyCode
    }
    
    // MARK: - User Info
    var userFullName: String {
        return currentUser?.fullName ?? "Unknown User"
    }
    
    var userEmail: String {
        return currentUser?.email ?? ""
    }
    
    var userPhone: String {
        return currentUser?.phoneNumber ?? ""
    }
    
    // MARK: - Error Handling
    func clearError() {
        errorMessage = nil
    }
    
    // MARK: - Token Management
    var authToken: String? {
        return UserDefaults.standard.string(forKey: "authToken")
    }
    
    func refreshToken() {
        // Implement token refresh logic if needed
        // For now, we'll just reload the user profile
        if isAuthenticated {
            loadUserProfile()
        }
    }
    
    // MARK: - Session Management
    func checkSessionValidity() {
        guard let token = authToken, !token.isEmpty else {
            clearAuthData()
            return
        }
        
        // You could implement token validation here
        // For now, we'll just check if the token exists
        if !isAuthenticated {
            isAuthenticated = true
            loadUserProfile()
        }
    }
    
    // MARK: - Biometric Authentication (Future Enhancement)
    func enableBiometricAuth() {
        // Implement biometric authentication
        // This would integrate with Face ID or Touch ID
    }
    
    func disableBiometricAuth() {
        // Disable biometric authentication
    }
    
    // MARK: - Auto-login
    func enableAutoLogin() {
        UserDefaults.standard.set(true, forKey: "autoLoginEnabled")
    }
    
    func disableAutoLogin() {
        UserDefaults.standard.set(false, forKey: "autoLoginEnabled")
    }
    
    var isAutoLoginEnabled: Bool {
        return UserDefaults.standard.bool(forKey: "autoLoginEnabled")
    }
    
    // MARK: - Remember Me
    func enableRememberMe() {
        UserDefaults.standard.set(true, forKey: "rememberMeEnabled")
    }
    
    func disableRememberMe() {
        UserDefaults.standard.set(false, forKey: "rememberMeEnabled")
    }
    
    var isRememberMeEnabled: Bool {
        return UserDefaults.standard.bool(forKey: "rememberMeEnabled")
    }
    
    // MARK: - Security
    func changePassword(currentPassword: String, newPassword: String) {
        // Implement password change functionality
        // This would require an API endpoint for password changes
    }
    
    func forgotPassword(email: String) {
        // Implement forgot password functionality
        // This would require an API endpoint for password reset
    }
    
    // MARK: - Account Verification
    var isEmailVerified: Bool {
        return currentUser?.emailVerified != nil
    }
    
    var isAccountVerified: Bool {
        return currentUser?.isVerified ?? false
    }
    
    func resendVerificationEmail() {
        // Implement email verification resend
        // This would require an API endpoint for resending verification emails
    }
    
    // MARK: - Account Status
    var isAccountActive: Bool {
        return currentUser?.isActive ?? false
    }
    
    var failedLoginAttempts: Int {
        return currentUser?.failedLoginAttempts ?? 0
    }
    
    var isAccountLocked: Bool {
        return failedLoginAttempts >= 5
    }
    
    // MARK: - Last Login
    var lastLoginDate: Date? {
        guard let lastLoginString = currentUser?.lastLoginAttempt else { return nil }
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: lastLoginString)
    }
    
    // MARK: - Account Creation
    var accountCreationDate: Date? {
        guard let createdAtString = currentUser?.createdAt else { return nil }
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: createdAtString)
    }
    
    // MARK: - Account Age
    var accountAge: TimeInterval? {
        guard let creationDate = accountCreationDate else { return nil }
        return Date().timeIntervalSince(creationDate)
    }
    
    var accountAgeInDays: Int? {
        guard let age = accountAge else { return nil }
        return Int(age / (24 * 60 * 60))
    }
} 