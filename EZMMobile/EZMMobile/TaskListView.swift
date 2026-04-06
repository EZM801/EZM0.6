import SwiftUI

struct TaskListView: View {
    @StateObject private var viewModel = TaskListViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: TaskFilter = .all
    @State private var showingCreateTask = false
    @State private var selectedTask: Task?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search tasks...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(TaskFilter.allCases, id: \.self) { filter in
                                FilterPill(
                                    title: filter.displayName,
                                    isSelected: selectedFilter == filter,
                                    count: viewModel.taskCount(for: filter)
                                ) {
                                    selectedFilter = filter
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                
                // Tasks List
                if viewModel.isLoading {
                    Spacer()
                    ProgressView("Loading tasks...")
                    Spacer()
                } else if filteredTasks.isEmpty {
                    EmptyStateView(
                        icon: "checklist",
                        title: "No Tasks Found",
                        message: selectedFilter == .all ? "Create your first task to get started" : "No tasks match your current filter"
                    )
                } else {
                    List {
                        ForEach(filteredTasks) { task in
                            TaskRowView(task: task) {
                                selectedTask = task
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Tasks")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateTask = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadTasks()
            }
            .onAppear {
                Task {
                    await viewModel.loadTasks()
                }
            }
            .sheet(isPresented: $showingCreateTask) {
                CreateTaskView()
            }
            .sheet(item: $selectedTask) { task in
                TaskDetailView(task: task)
            }
        }
    }
    
    private var filteredTasks: [Task] {
        var tasks = viewModel.tasks
        
        // Apply filter
        switch selectedFilter {
        case .all:
            break
        case .pending:
            tasks = tasks.filter { $0.status.lowercased() == "pending" }
        case .inProgress:
            tasks = tasks.filter { $0.status.lowercased() == "in_progress" }
        case .completed:
            tasks = tasks.filter { $0.status.lowercased() == "completed" }
        case .highPriority:
            tasks = tasks.filter { $0.priority.lowercased() == "high" || $0.priority.lowercased() == "urgent" }
        }
        
        // Apply search
        if !searchText.isEmpty {
            tasks = tasks.filter { task in
                task.name.localizedCaseInsensitiveContains(searchText) ||
                task.description?.localizedCaseInsensitiveContains(searchText) == true ||
                task.createdBy.fullName.localizedCaseInsensitiveContains(searchText) ||
                task.assignedToUser?.fullName.localizedCaseInsensitiveContains(searchText) == true
            }
        }
        
        return tasks
    }
}

// MARK: - Supporting Views
struct TaskRowView: View {
    let task: Task
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // Priority Icon
                Circle()
                    .fill(priorityColor.opacity(0.1))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "checklist")
                            .foregroundColor(priorityColor)
                            .font(.title3)
                    )
                
                // Task Details
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(task.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        StatusBadge(status: task.status)
                    }
                    
                    if let description = task.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    
                    // Task Info
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: "person.fill")
                                .foregroundColor(.blue)
                                .font(.caption)
                            Text("Created by: \(task.createdBy.fullName)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if let assignedTo = task.assignedToUser {
                            HStack {
                                Image(systemName: "person.badge.plus")
                                    .foregroundColor(.green)
                                    .font(.caption)
                                Text("Assigned to: \(assignedTo.fullName)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        if let dueDate = task.dueDate {
                            HStack {
                                Image(systemName: "calendar")
                                    .foregroundColor(.orange)
                                    .font(.caption)
                                Text("Due: \(formatDate(dueDate))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    
                    // Task Stats
                    HStack(spacing: 16) {
                        TaskStatView(
                            icon: "flag.fill",
                            value: task.priority.capitalized,
                            label: "Priority",
                            color: priorityColor
                        )
                        
                        TaskStatView(
                            icon: "clock.fill",
                            value: formatDate(task.createdAt),
                            label: "Created",
                            color: .gray
                        )
                    }
                }
                
                Spacer()
                
                // Chevron
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 3, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
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

struct TaskStatView: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(color)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(label)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Task Filter
enum TaskFilter: CaseIterable {
    case all
    case pending
    case inProgress
    case completed
    case highPriority
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .pending: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .highPriority: return "High Priority"
        }
    }
}

// MARK: - View Model
class TaskListViewModel: ObservableObject {
    @Published var tasks: [Task] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadTasks() async {
        isLoading = true
        errorMessage = nil
        
        // For now, we'll load tasks from the first move
        // In a real app, you might want to load all tasks or filter by move
        do {
            // This is a placeholder - you'd need to implement a way to get all tasks
            // or filter by specific criteria
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
            
            // Combine tasks from all moves
            var allTasks: [Task] = []
            for move in moves {
                allTasks.append(contentsOf: move.tasks)
            }
            
            self.tasks = allTasks
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func taskCount(for filter: TaskFilter) -> Int {
        switch filter {
        case .all:
            return tasks.count
        case .pending:
            return tasks.filter { $0.status.lowercased() == "pending" }.count
        case .inProgress:
            return tasks.filter { $0.status.lowercased() == "in_progress" }.count
        case .completed:
            return tasks.filter { $0.status.lowercased() == "completed" }.count
        case .highPriority:
            return tasks.filter { $0.priority.lowercased() == "high" || $0.priority.lowercased() == "urgent" }.count
        }
    }
}

// MARK: - Placeholder Views
struct CreateTaskView: View {
    var body: some View {
        NavigationView {
            Text("Create Task View")
                .navigationTitle("New Task")
        }
    }
}

struct TaskDetailView: View {
    let task: Task
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Task Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(priorityColor.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "checklist")
                                        .foregroundColor(priorityColor)
                                        .font(.title2)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(task.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text("Priority: \(task.priority.capitalized)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            StatusBadge(status: task.status)
                        }
                        
                        if let description = task.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Task Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Task Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            DetailRow(
                                title: "Created By",
                                value: task.createdBy.fullName,
                                icon: "person.fill",
                                color: .blue
                            )
                            
                            if let assignedTo = task.assignedToUser {
                                DetailRow(
                                    title: "Assigned To",
                                    value: assignedTo.fullName,
                                    icon: "person.badge.plus",
                                    color: .green
                                )
                            }
                            
                            DetailRow(
                                title: "Priority",
                                value: task.priority.capitalized,
                                icon: "flag.fill",
                                color: priorityColor
                            )
                            
                            DetailRow(
                                title: "Status",
                                value: task.status.capitalized,
                                icon: "circle.fill",
                                color: statusColor
                            )
                            
                            if let dueDate = task.dueDate {
                                DetailRow(
                                    title: "Due Date",
                                    value: formatDate(dueDate),
                                    icon: "calendar",
                                    color: .orange
                                )
                            }
                            
                            DetailRow(
                                title: "Created",
                                value: formatDate(task.createdAt),
                                icon: "clock.fill",
                                color: .gray
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Actions
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Actions")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            CustomButton(
                                title: "Mark as In Progress",
                                icon: "play.fill",
                                style: .primary
                            ) {
                                // Implement status update
                            }
                            
                            CustomButton(
                                title: "Mark as Completed",
                                icon: "checkmark.circle.fill",
                                style: .primary
                            ) {
                                // Implement status update
                            }
                            
                            CustomButton(
                                title: "Edit Task",
                                icon: "pencil",
                                style: .outline
                            ) {
                                // Navigate to edit task
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Task Details")
            .navigationBarTitleDisplayMode(.inline)
        }
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
            formatter.dateStyle = .medium
            formatter.timeStyle = .short
            return formatter.string(from: date)
        }
        
        return dateString
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    let icon: String
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

#Preview {
    TaskListView()
} 