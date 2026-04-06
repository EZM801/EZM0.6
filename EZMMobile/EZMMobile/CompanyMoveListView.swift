import SwiftUI

struct CompanyMoveListView: View {
    @StateObject private var viewModel = CompanyMoveListViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: CompanyMoveFilter = .all
    @State private var showingCreateMove = false
    @State private var selectedMove: CompanyMove?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search company moves...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(CompanyMoveFilter.allCases, id: \.self) { filter in
                                FilterPill(
                                    title: filter.displayName,
                                    isSelected: selectedFilter == filter,
                                    count: viewModel.moveCount(for: filter)
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
                
                // Moves List
                if viewModel.isLoading {
                    Spacer()
                    ProgressView("Loading company moves...")
                    Spacer()
                } else if filteredMoves.isEmpty {
                    EmptyStateView(
                        icon: "building.2",
                        title: "No Company Moves Found",
                        message: selectedFilter == .all ? "Create your first company move to get started" : "No company moves match your current filter"
                    )
                } else {
                    List {
                        ForEach(filteredMoves) { move in
                            CompanyMoveRowView(move: move) {
                                selectedMove = move
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Company Moves")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingCreateMove = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadMoves()
            }
            .onAppear {
                Task {
                    await viewModel.loadMoves()
                }
            }
            .onChange(of: searchText) { _ in
                // Search is handled by computed property
            }
            .sheet(isPresented: $showingCreateMove) {
                CreateCompanyMoveView()
            }
            .sheet(item: $selectedMove) { move in
                CompanyMoveDetailView(move: move)
            }
        }
    }
    
    private var filteredMoves: [CompanyMove] {
        var moves = viewModel.moves
        
        // Apply filter
        switch selectedFilter {
        case .all:
            break
        case .pending:
            moves = moves.filter { $0.status.lowercased() == "pending" }
        case .inProgress:
            moves = moves.filter { $0.status.lowercased() == "in_progress" }
        case .completed:
            moves = moves.filter { $0.status.lowercased() == "completed" }
        case .cancelled:
            moves = moves.filter { $0.status.lowercased() == "cancelled" }
        case .highPriority:
            moves = moves.filter { $0.priority.lowercased() == "high" || $0.priority.lowercased() == "urgent" }
        }
        
        // Apply search
        if !searchText.isEmpty {
            moves = moves.filter { move in
                move.name.localizedCaseInsensitiveContains(searchText) ||
                move.clientName.localizedCaseInsensitiveContains(searchText) ||
                move.clientEmail.localizedCaseInsensitiveContains(searchText) ||
                (move.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        return moves
    }
}

// MARK: - Company Move Row View
struct CompanyMoveRowView: View {
    let move: CompanyMove
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(move.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
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
                        .lineLimit(2)
                }
                
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Start Date")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(formatDate(move.startDate))
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)
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
                                .foregroundColor(.primary)
                        }
                    }
                }
                
                HStack {
                    if let budget = move.estimatedBudget {
                        Text("Budget: $\(String(format: "%.2f", budget))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Text("\(move.tasks.count) tasks")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(move.employees.count) employees")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
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

// MARK: - Company Move List View Model
class CompanyMoveListViewModel: ObservableObject {
    @Published var moves: [CompanyMove] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadMoves() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let loadedMoves = try await withCheckedThrowingContinuation { continuation in
                apiService.getCompanyMoves()
                    .sink(
                        receiveCompletion: { completion in
                            switch completion {
                            case .finished:
                                break
                            case .failure(let error):
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { moves in
                            continuation.resume(returning: moves)
                        }
                    )
                    .store(in: &apiService.cancellables)
            }
            
            self.moves = loadedMoves
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func moveCount(for filter: CompanyMoveFilter) -> Int {
        switch filter {
        case .all:
            return moves.count
        case .pending:
            return moves.filter { $0.status.lowercased() == "pending" }.count
        case .inProgress:
            return moves.filter { $0.status.lowercased() == "in_progress" }.count
        case .completed:
            return moves.filter { $0.status.lowercased() == "completed" }.count
        case .cancelled:
            return moves.filter { $0.status.lowercased() == "cancelled" }.count
        case .highPriority:
            return moves.filter { $0.priority.lowercased() == "high" || $0.priority.lowercased() == "urgent" }.count
        }
    }
}

// MARK: - Company Move Filter
enum CompanyMoveFilter: CaseIterable {
    case all
    case pending
    case inProgress
    case completed
    case cancelled
    case highPriority
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .pending: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .highPriority: return "High Priority"
        }
    }
}

// MARK: - Filter Pill
struct FilterPill: View {
    let title: String
    let isSelected: Bool
    let count: Int
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                
                Text("(\(count))")
                    .font(.caption2)
                    .fontWeight(.regular)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.blue : Color(.systemGray5))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Create Company Move View (Placeholder)
struct CreateCompanyMoveView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Create Company Move")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("This view will contain a form to create a new company move")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()
            }
            .navigationTitle("New Company Move")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        // TODO: Implement create functionality
                        presentationMode.wrappedValue.dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

// MARK: - Empty State View
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