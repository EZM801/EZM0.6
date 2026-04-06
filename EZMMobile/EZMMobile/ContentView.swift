import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .onAppear {
            authManager.checkSessionValidity()
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Dashboard")
                }
                .tag(0)
            
            MoveListView()
                .tabItem {
                    Image(systemName: "truck.box.fill")
                    Text("Moves")
                }
                .tag(1)
            
            if authManager.isCompanyAccount {
                CompanyTabView()
                    .tabItem {
                        Image(systemName: "building.2.fill")
                        Text("Company")
                    }
                    .tag(2)
            }
            
            QRScannerView()
                .tabItem {
                    Image(systemName: "qrcode.viewfinder")
                    Text("Scan QR")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(4)
        }
        .accentColor(.blue)
    }
}

struct CompanyTabView: View {
    @State private var selectedCompanyTab = 0
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("Company Section", selection: $selectedCompanyTab) {
                    Text("Moves").tag(0)
                    Text("Employees").tag(1)
                    Text("Equipment").tag(2)
                    Text("Supplies").tag(3)
                    Text("Vehicles").tag(4)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                TabView(selection: $selectedCompanyTab) {
                    CompanyMoveListView()
                        .tag(0)
                    
                    EmployeeListView()
                        .tag(1)
                    
                    EquipmentView()
                        .tag(2)
                    
                    SuppliesView()
                        .tag(3)
                    
                    VehicleListView()
                        .tag(4)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            }
            .navigationTitle("Company Management")
        }
    }
}

struct EmployeeListView: View {
    @StateObject private var viewModel = EmployeeListViewModel()
    
    var body: some View {
        List {
            ForEach(viewModel.employees) { employee in
                EmployeeRowView(employee: employee)
            }
        }
        .refreshable {
            await viewModel.loadEmployees()
        }
        .onAppear {
            Task {
                await viewModel.loadEmployees()
            }
        }
    }
}

struct EmployeeRowView: View {
    let employee: Employee
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(employee.name)
                    .font(.headline)
                Spacer()
                Text(employee.role)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(employee.email)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if let phone = employee.phone {
                Text(phone)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct VehicleListView: View {
    @StateObject private var viewModel = VehicleListViewModel()
    
    var body: some View {
        List {
            ForEach(viewModel.vehicles) { vehicle in
                VehicleRowView(vehicle: vehicle)
            }
        }
        .refreshable {
            await viewModel.loadVehicles()
        }
        .onAppear {
            Task {
                await viewModel.loadVehicles()
            }
        }
    }
}

struct VehicleRowView: View {
    let vehicle: Vehicle
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(vehicle.name)
                    .font(.headline)
                Spacer()
                Text(vehicle.type)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text("License: \(vehicle.licensePlate)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Text("Capacity: \(vehicle.capacity)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text(vehicle.isAvailable ? "Available" : "In Use")
                    .font(.caption)
                    .foregroundColor(vehicle.isAvailable ? .green : .orange)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - View Models
class EmployeeListViewModel: ObservableObject {
    @Published var employees: [Employee] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadEmployees() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let employees = try await withCheckedThrowingContinuation { continuation in
                apiService.getEmployees()
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { employees in
                            continuation.resume(returning: employees)
                        }
                    )
                    .store(in: &Set<AnyCancellable>())
            }
            
            self.employees = employees
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

class VehicleListViewModel: ObservableObject {
    @Published var vehicles: [Vehicle] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadVehicles() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let vehicles = try await withCheckedThrowingContinuation { continuation in
                apiService.getVehicles()
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { vehicles in
                            continuation.resume(returning: vehicles)
                        }
                    )
                    .store(in: &Set<AnyCancellable>())
            }
            
            self.vehicles = vehicles
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager())
        .environmentObject(APIService())
} 