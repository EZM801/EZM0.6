import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = DashboardViewModel()
    @State private var showingCreateMove = false
    @State private var selectedMove: Move?
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Welcome Section
                    welcomeSection
                    
                    // Quick Stats
                    statsSection
                    
                    // Recent Moves
                    recentMovesSection
                    
                    // Quick Actions
                    quickActionsSection
                    
                    // Recent Tasks
                    if !viewModel.recentTasks.isEmpty {
                        recentTasksSection
                    }
                    
                    // Company Stats (if company account)
                    if authManager.isCompanyAccount {
                        companyStatsSection
                    }
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateMove = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadDashboardData()
            }
            .onAppear {
                Task {
                    await viewModel.loadDashboardData()
                }
            }
            .sheet(isPresented: $showingCreateMove) {
                CreateMoveView()
            }
            .sheet(item: $selectedMove) { move in
                MoveDetailView(move: move)
            }
        }
    }
    
    // MARK: - Welcome Section
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Welcome back,")
                        .font(.title2)
                        .foregroundColor(.secondary)
                    
                    Text(authManager.userFullName)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
                
                Spacer()
                
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Text(String(authManager.userFullName.prefix(1)))
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                    )
            }
            
            Text("Here's what's happening with your moves today")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Stats Section
    private var statsSection: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
            StatCard(
                title: "Active Moves",
                value: "\(viewModel.activeMovesCount)",
                icon: "truck.box.fill",
                color: .blue
            )
            
            StatCard(
                title: "Pending Tasks",
                value: "\(viewModel.pendingTasksCount)",
                icon: "checklist",
                color: .orange
            )
            
            StatCard(
                title: "Completed Moves",
                value: "\(viewModel.completedMovesCount)",
                icon: "checkmark.circle.fill",
                color: .green
            )
            
            StatCard(
                title: "Total Items",
                value: "\(viewModel.totalItemsCount)",
                icon: "cube.box.fill",
                color: .purple
            )
        }
    }
    
    // MARK: - Recent Moves Section
    private var recentMovesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Moves")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Spacer()
                
                NavigationLink("View All") {
                    MoveListView()
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
            
            if viewModel.recentMoves.isEmpty {
                EmptyStateView(
                    icon: "truck.box",
                    title: "No Moves Yet",
                    message: "Create your first move to get started"
                )
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.recentMoves.prefix(3)) { move in
                        MoveCardView(move: move) {
                            selectedMove = move
                        }
                    }
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
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                QuickActionCard(
                    title: "New Move",
                    icon: "plus.circle.fill",
                    color: .blue
                ) {
                    showingCreateMove = true
                }
                
                QuickActionCard(
                    title: "Scan QR",
                    icon: "qrcode.viewfinder",
                    color: .green
                ) {
                    // Navigate to QR scanner
                }
                
                QuickActionCard(
                    title: "Add Item",
                    icon: "cube.box",
                    color: .orange
                ) {
                    // Navigate to add item
                }
                
                QuickActionCard(
                    title: "View Tasks",
                    icon: "checklist",
                    color: .purple
                ) {
                    // Navigate to tasks
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Recent Tasks Section
    private var recentTasksSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Tasks")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Spacer()
                
                NavigationLink("View All") {
                    TaskListView()
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
            
            LazyVStack(spacing: 12) {
                ForEach(viewModel.recentTasks.prefix(3)) { task in
                    TaskCardView(task: task)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Company Stats Section
    private var companyStatsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Company Overview")
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                StatCard(
                    title: "Employees",
                    value: "\(viewModel.employeesCount)",
                    icon: "person.2.fill",
                    color: .indigo
                )
                
                StatCard(
                    title: "Equipment",
                    value: "\(viewModel.equipmentCount)",
                    icon: "wrench.and.screwdriver.fill",
                    color: .teal
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

// MARK: - Supporting Views
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
    }
}

struct QuickActionCard: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 80)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct MoveCardView: View {
    let move: Move
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Circle()
                    .fill(statusColor.opacity(0.1))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: "truck.box.fill")
                            .foregroundColor(statusColor)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(move.name)
                        .font(.headline)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    Text(move.moveType.capitalized)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if let fromAddress = move.fromAddress {
                        Text("From: \(fromAddress.city), \(fromAddress.state)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text(move.status.capitalized)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(statusColor)
                    
                    Text("\(move.items.count) items")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var statusColor: Color {
        switch move.status.lowercased() {
        case "draft": return .gray
        case "pending": return .orange
        case "in_progress": return .blue
        case "completed": return .green
        case "cancelled": return .red
        default: return .gray
        }
    }
}

struct TaskCardView: View {
    let task: Task
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(priorityColor.opacity(0.1))
                .frame(width: 32, height: 32)
                .overlay(
                    Image(systemName: "checklist")
                        .foregroundColor(priorityColor)
                        .font(.caption)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(task.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                
                Text(task.status.capitalized)
                    .font(.caption)
                    .foregroundColor(statusColor)
                
                if let dueDate = task.dueDate {
                    Text("Due: \(formatDate(dueDate))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Text(task.priority.capitalized)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(priorityColor)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
    }
    
    private var priorityColor: Color {
        switch task.priority.lowercased() {
        case "low": return .green
        case "normal": return .blue
        case "high": return .orange
        case "urgent": return .red
        default: return .blue
        }
    }
    
    private var statusColor: Color {
        switch task.status.lowercased() {
        case "pending": return .gray
        case "in_progress": return .blue
        case "completed": return .green
        case "cancelled": return .red
        default: return .gray
        }
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

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
    }
}

// MARK: - View Model
class DashboardViewModel: ObservableObject {
    @Published var recentMoves: [Move] = []
    @Published var recentTasks: [Task] = []
    @Published var activeMovesCount = 0
    @Published var completedMovesCount = 0
    @Published var pendingTasksCount = 0
    @Published var totalItemsCount = 0
    @Published var employeesCount = 0
    @Published var equipmentCount = 0
    @Published var isLoading = false
    
    private let apiService = APIService()
    
    @MainActor
    func loadDashboardData() async {
        isLoading = true
        
        // Load moves
        do {
            let moves = try await withCheckedThrowingContinuation { continuation in
                apiService.getMoves()
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { moves in
                            continuation.resume(returning: moves)
                        }
                    )
                    .store(in: &Set<AnyCancellable>())
            }
            
            self.recentMoves = Array(moves.prefix(5))
            self.activeMovesCount = moves.filter { $0.status.lowercased() == "in_progress" }.count
            self.completedMovesCount = moves.filter { $0.status.lowercased() == "completed" }.count
            self.totalItemsCount = moves.reduce(0) { $0 + $1.items.count }
            
        } catch {
            print("Failed to load moves: \(error)")
        }
        
        // Load tasks for the first move (if any)
        if let firstMove = recentMoves.first {
            do {
                let tasks = try await withCheckedThrowingContinuation { continuation in
                    apiService.getTasks(moveId: firstMove.id)
                        .sink(
                            receiveCompletion: { completion in
                                if case .failure(let error) = completion {
                                    continuation.resume(throwing: error)
                                }
                            },
                            receiveValue: { tasks in
                                continuation.resume(returning: tasks)
                            }
                        )
                        .store(in: &Set<AnyCancellable>())
                }
                
                self.recentTasks = Array(tasks.prefix(5))
                self.pendingTasksCount = tasks.filter { $0.status.lowercased() == "pending" }.count
                
            } catch {
                print("Failed to load tasks: \(error)")
            }
        }
        
        isLoading = false
    }
}

// MARK: - Placeholder Views (to be implemented)
struct CreateMoveView: View {
    var body: some View {
        Text("Create Move View")
            .navigationTitle("New Move")
    }
}

struct MoveDetailView: View {
    let move: Move
    
    var body: some View {
        Text("Move Detail: \(move.name)")
            .navigationTitle("Move Details")
    }
}

struct TaskListView: View {
    var body: some View {
        Text("Task List View")
            .navigationTitle("Tasks")
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthManager())
} 