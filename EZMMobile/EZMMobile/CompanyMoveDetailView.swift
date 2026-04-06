import SwiftUI

struct CompanyMoveDetailView: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var selectedTab = 0
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(move.name)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("Client: \(move.clientName)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        StatusBadge(status: move.status)
                        PriorityBadge(priority: move.priority)
                    }
                }
                
                if let description = move.description, !description.isEmpty {
                    Text(description)
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Start Date")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(formatDate(move.startDate))
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    
                    Spacer()
                    
                    if let endDate = move.endDate {
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("End Date")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(formatDate(endDate))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                    }
                }
                
                if let budget = move.estimatedBudget {
                    HStack {
                        Text("Estimated Budget:")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text("$\(String(format: "%.2f", budget))")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Spacer()
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            
            // Tab Picker
            Picker("Section", selection: $selectedTab) {
                Text("Overview").tag(0)
                Text("Tasks").tag(1)
                Text("Employees").tag(2)
                Text("Vehicles").tag(3)
                Text("Equipment").tag(4)
                Text("Supplies").tag(5)
                Text("Items").tag(6)
                Text("Layouts").tag(7)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding(.horizontal)
            .padding(.bottom, 8)
            
            // Tab Content
            TabView(selection: $selectedTab) {
                OverviewTab(move: move)
                    .tag(0)
                
                TasksTab(move: move)
                    .tag(1)
                
                EmployeesTab(move: move)
                    .tag(2)
                
                VehiclesTab(move: move)
                    .tag(3)
                
                EquipmentTab(move: move)
                    .tag(4)
                
                SuppliesTab(move: move)
                    .tag(5)
                
                ItemsTab(move: move)
                    .tag(6)
                
                LayoutsTab(move: move)
                    .tag(7)
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
        }
        .navigationTitle("Move Details")
        .navigationBarTitleDisplayMode(.inline)
        .background(Color(.systemGroupedBackground))
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        
        if let date = formatter.date(from: dateString) {
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
        return dateString
    }
}

// MARK: - Overview Tab
struct OverviewTab: View {
    let move: CompanyMove
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Client Information
                InfoCard(title: "Client Information") {
                    VStack(alignment: .leading, spacing: 8) {
                        InfoRow(label: "Name", value: move.clientName)
                        InfoRow(label: "Email", value: move.clientEmail)
                        InfoRow(label: "Phone", value: move.clientPhone)
                    }
                }
                
                // Addresses
                if let fromAddress = move.fromAddress {
                    InfoCard(title: "From Address") {
                        AddressView(address: fromAddress)
                    }
                }
                
                if let toAddress = move.toAddress {
                    InfoCard(title: "To Address") {
                        AddressView(address: toAddress)
                    }
                }
                
                // Special Instructions
                if let instructions = move.specialInstructions, !instructions.isEmpty {
                    InfoCard(title: "Special Instructions") {
                        Text(instructions)
                            .font(.body)
                    }
                }
                
                // Statistics
                StatisticsCard(move: move)
            }
            .padding()
        }
    }
}

// MARK: - Tasks Tab
struct TasksTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var tasks: [CompanyMoveTask] = []
    @State private var isLoading = false
    @State private var showingAddTask = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if tasks.isEmpty {
                EmptyStateView(
                    icon: "checklist",
                    title: "No Tasks",
                    message: "No tasks have been created for this move yet."
                )
            } else {
                List(tasks) { task in
                    TaskRowView(task: task)
                }
            }
        }
        .navigationTitle("Tasks")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Task") {
                    showingAddTask = true
                }
            }
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskView(moveId: move.id)
        }
        .onAppear {
            loadTasks()
        }
    }
    
    private func loadTasks() {
        isLoading = true
        apiService.getCompanyMoveTasks(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading tasks: \(error)")
                    }
                },
                receiveValue: { loadedTasks in
                    self.tasks = loadedTasks
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Employees Tab
struct EmployeesTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var employees: [CompanyMoveEmployee] = []
    @State private var isLoading = false
    @State private var showingAddEmployee = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if employees.isEmpty {
                EmptyStateView(
                    icon: "person.2",
                    title: "No Employees",
                    message: "No employees have been assigned to this move yet."
                )
            } else {
                List(employees) { employee in
                    EmployeeRowView(employee: employee)
                }
            }
        }
        .navigationTitle("Employees")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Employee") {
                    showingAddEmployee = true
                }
            }
        }
        .sheet(isPresented: $showingAddEmployee) {
            AddEmployeeView(moveId: move.id)
        }
        .onAppear {
            loadEmployees()
        }
    }
    
    private func loadEmployees() {
        isLoading = true
        apiService.getCompanyMoveEmployees(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading employees: \(error)")
                    }
                },
                receiveValue: { loadedEmployees in
                    self.employees = loadedEmployees
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Vehicles Tab
struct VehiclesTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var vehicles: [CompanyMoveVehicle] = []
    @State private var isLoading = false
    @State private var showingAddVehicle = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if vehicles.isEmpty {
                EmptyStateView(
                    icon: "car",
                    title: "No Vehicles",
                    message: "No vehicles have been assigned to this move yet."
                )
            } else {
                List(vehicles) { vehicle in
                    VehicleRowView(vehicle: vehicle)
                }
            }
        }
        .navigationTitle("Vehicles")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Vehicle") {
                    showingAddVehicle = true
                }
            }
        }
        .sheet(isPresented: $showingAddVehicle) {
            AddVehicleView(moveId: move.id)
        }
        .onAppear {
            loadVehicles()
        }
    }
    
    private func loadVehicles() {
        isLoading = true
        apiService.getCompanyMoveVehicles(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading vehicles: \(error)")
                    }
                },
                receiveValue: { loadedVehicles in
                    self.vehicles = loadedVehicles
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Equipment Tab
struct EquipmentTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var equipment: [CompanyMoveEquipment] = []
    @State private var isLoading = false
    @State private var showingAddEquipment = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if equipment.isEmpty {
                EmptyStateView(
                    icon: "wrench.and.screwdriver",
                    title: "No Equipment",
                    message: "No equipment has been assigned to this move yet."
                )
            } else {
                List(equipment) { item in
                    EquipmentRowView(equipment: item)
                }
            }
        }
        .navigationTitle("Equipment")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Equipment") {
                    showingAddEquipment = true
                }
            }
        }
        .sheet(isPresented: $showingAddEquipment) {
            AddEquipmentView(moveId: move.id)
        }
        .onAppear {
            loadEquipment()
        }
    }
    
    private func loadEquipment() {
        isLoading = true
        apiService.getCompanyMoveEquipment(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading equipment: \(error)")
                    }
                },
                receiveValue: { loadedEquipment in
                    self.equipment = loadedEquipment
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Supplies Tab
struct SuppliesTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var supplies: [CompanyMoveSupply] = []
    @State private var isLoading = false
    @State private var showingAddSupply = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if supplies.isEmpty {
                EmptyStateView(
                    icon: "shippingbox",
                    title: "No Supplies",
                    message: "No supplies have been assigned to this move yet."
                )
            } else {
                List(supplies) { supply in
                    SupplyRowView(supply: supply)
                }
            }
        }
        .navigationTitle("Supplies")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Supply") {
                    showingAddSupply = true
                }
            }
        }
        .sheet(isPresented: $showingAddSupply) {
            AddSupplyView(moveId: move.id)
        }
        .onAppear {
            loadSupplies()
        }
    }
    
    private func loadSupplies() {
        isLoading = true
        apiService.getCompanyMoveSupplies(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading supplies: \(error)")
                    }
                },
                receiveValue: { loadedSupplies in
                    self.supplies = loadedSupplies
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Items Tab
struct ItemsTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var items: [CompanyItem] = []
    @State private var isLoading = false
    @State private var showingAddItem = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if items.isEmpty {
                EmptyStateView(
                    icon: "cube.box",
                    title: "No Items",
                    message: "No items have been added to this move yet."
                )
            } else {
                List(items) { item in
                    ItemRowView(item: item)
                }
            }
        }
        .navigationTitle("Items")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Item") {
                    showingAddItem = true
                }
            }
        }
        .sheet(isPresented: $showingAddItem) {
            AddItemView(moveId: move.id)
        }
        .onAppear {
            loadItems()
        }
    }
    
    private func loadItems() {
        isLoading = true
        apiService.getCompanyMoveItems(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading items: \(error)")
                    }
                },
                receiveValue: { loadedItems in
                    self.items = loadedItems
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Layouts Tab
struct LayoutsTab: View {
    let move: CompanyMove
    @EnvironmentObject var apiService: APIService
    @State private var layouts: [CompanyMoveLayout] = []
    @State private var isLoading = false
    @State private var showingAddLayout = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if layouts.isEmpty {
                EmptyStateView(
                    icon: "square.grid.2x2",
                    title: "No Layouts",
                    message: "No layouts have been created for this move yet."
                )
            } else {
                List(layouts) { layout in
                    LayoutRowView(layout: layout)
                }
            }
        }
        .navigationTitle("Layouts")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Add Layout") {
                    showingAddLayout = true
                }
            }
        }
        .sheet(isPresented: $showingAddLayout) {
            AddLayoutView(moveId: move.id)
        }
        .onAppear {
            loadLayouts()
        }
    }
    
    private func loadLayouts() {
        isLoading = true
        apiService.getCompanyMoveLayouts(moveId: move.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        print("Error loading layouts: \(error)")
                    }
                },
                receiveValue: { loadedLayouts in
                    self.layouts = loadedLayouts
                }
            )
            .store(in: &apiService.cancellables)
    }
}

// MARK: - Supporting Views
struct StatusBadge: View {
    let status: String
    
    var body: some View {
        Text(status.replacingOccurrences(of: "_", with: " ").capitalized)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor)
            .foregroundColor(.white)
            .cornerRadius(8)
    }
    
    private var statusColor: Color {
        switch status.lowercased() {
        case "pending": return .orange
        case "in_progress": return .blue
        case "completed": return .green
        case "cancelled": return .red
        default: return .gray
        }
    }
}

struct PriorityBadge: View {
    let priority: String
    
    var body: some View {
        Text(priority.capitalized)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(priorityColor)
            .foregroundColor(.white)
            .cornerRadius(8)
    }
    
    private var priorityColor: Color {
        switch priority.lowercased() {
        case "low": return .green
        case "medium": return .orange
        case "high": return .red
        case "urgent": return .purple
        default: return .gray
        }
    }
}

struct InfoCard<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
            
            content
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(width: 80, alignment: .leading)
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
            
            Spacer()
        }
    }
}

struct AddressView: View {
    let address: Address
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(address.street)
                .font(.subheadline)
                .fontWeight(.medium)
            
            Text("\(address.city), \(address.state) \(address.zipCode)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if let floor = address.floorNumber {
                Text("Floor \(floor)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            if address.hasElevator {
                Text("Has Elevator")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
        }
    }
}

struct StatisticsCard: View {
    let move: CompanyMove
    
    var body: some View {
        InfoCard(title: "Statistics") {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                StatItem(title: "Tasks", value: "\(move.tasks.count)")
                StatItem(title: "Employees", value: "\(move.employees.count)")
                StatItem(title: "Vehicles", value: "\(move.vehicles.count)")
                StatItem(title: "Equipment", value: "\(move.equipment.count)")
                StatItem(title: "Supplies", value: "\(move.supplies.count)")
                StatItem(title: "Items", value: "\(move.itemLists.flatMap { $0.items }.count)")
            }
        }
    }
}

struct StatItem: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - Row Views
struct TaskRowView: View {
    let task: CompanyMoveTask
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(task.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                StatusBadge(status: task.status)
            }
            
            if let description = task.description, !description.isEmpty {
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                PriorityBadge(priority: task.priority)
                
                Spacer()
                
                if let assignedTo = task.assignedTo {
                    Text("Assigned to \(assignedTo.name)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct EmployeeRowView: View {
    let employee: CompanyMoveEmployee
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let employeeData = employee.employee {
                        Text(employeeData.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(employeeData.email)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Employee ID: \(employee.employeeId)")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                }
                
                Spacer()
                
                Text(employee.role)
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .foregroundColor(.blue)
                    .cornerRadius(8)
            }
            
            HStack {
                Text("Start: \(formatDate(employee.startDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if let endDate = employee.endDate {
                    Text("End: \(formatDate(endDate))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        
        if let date = formatter.date(from: dateString) {
            formatter.dateStyle = .short
            return formatter.string(from: date)
        }
        return dateString
    }
}

struct VehicleRowView: View {
    let vehicle: CompanyMoveVehicle
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let vehicleData = vehicle.vehicle {
                        Text(vehicleData.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(vehicleData.licensePlate)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Vehicle ID: \(vehicle.vehicleId)")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                }
                
                Spacer()
                
                if let vehicleData = vehicle.vehicle {
                    Text(vehicleData.type)
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.1))
                        .foregroundColor(.green)
                        .cornerRadius(8)
                }
            }
            
            HStack {
                Text("Start: \(formatDate(vehicle.startDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if let endDate = vehicle.endDate {
                    Text("End: \(formatDate(endDate))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        
        if let date = formatter.date(from: dateString) {
            formatter.dateStyle = .short
            return formatter.string(from: date)
        }
        return dateString
    }
}

struct EquipmentRowView: View {
    let equipment: CompanyMoveEquipment
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let equipmentData = equipment.equipment {
                        Text(equipmentData.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(equipmentData.type)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Equipment ID: \(equipment.equipmentId)")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                }
                
                Spacer()
                
                Text("Qty: \(equipment.quantity)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.1))
                    .foregroundColor(.orange)
                    .cornerRadius(8)
            }
            
            HStack {
                Text("Start: \(formatDate(equipment.startDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if let endDate = equipment.endDate {
                    Text("End: \(formatDate(endDate))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        
        if let date = formatter.date(from: dateString) {
            formatter.dateStyle = .short
            return formatter.string(from: date)
        }
        return dateString
    }
}

struct SupplyRowView: View {
    let supply: CompanyMoveSupply
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let supplyData = supply.supply {
                        Text(supplyData.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        if let type = supplyData.type {
                            Text(type)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        Text("Supply ID: \(supply.supplyId)")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                }
                
                Spacer()
                
                Text("Qty: \(supply.quantity)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.purple.opacity(0.1))
                    .foregroundColor(.purple)
                    .cornerRadius(8)
            }
        }
        .padding(.vertical, 4)
    }
}

struct ItemRowView: View {
    let item: CompanyItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    if let description = item.description, !description.isEmpty {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    if item.isFragile {
                        Text("Fragile")
                            .font(.caption)
                            .fontWeight(.medium)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.red.opacity(0.1))
                            .foregroundColor(.red)
                            .cornerRadius(6)
                    }
                    
                    StatusBadge(status: item.packingStatus)
                }
            }
            
            HStack {
                if let weight = item.weight {
                    Text("Weight: \(String(format: "%.1f", weight)) lbs")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if let value = item.value {
                    Text("Value: $\(String(format: "%.2f", value))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct LayoutRowView: View {
    let layout: CompanyMoveLayout
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(layout.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    if let instructions = layout.instructions, !instructions.isEmpty {
                        Text(instructions)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Text(layout.orientation.capitalized)
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.indigo.opacity(0.1))
                    .foregroundColor(.indigo)
                    .cornerRadius(8)
            }
            
            Text("\(layout.rooms.count) rooms")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Add Views (Placeholder implementations)
struct AddTaskView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Task View - Implementation needed")
                .navigationTitle("Add Task")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddEmployeeView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Employee View - Implementation needed")
                .navigationTitle("Add Employee")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddVehicleView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Vehicle View - Implementation needed")
                .navigationTitle("Add Vehicle")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddEquipmentView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Equipment View - Implementation needed")
                .navigationTitle("Add Equipment")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddSupplyView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Supply View - Implementation needed")
                .navigationTitle("Add Supply")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddItemView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Item View - Implementation needed")
                .navigationTitle("Add Item")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
}

struct AddLayoutView: View {
    let moveId: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Text("Add Layout View - Implementation needed")
                .navigationTitle("Add Layout")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
        }
    }
} 