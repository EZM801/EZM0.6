import SwiftUI

struct MoveListView: View {
    @StateObject private var viewModel = MoveListViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: MoveFilter = .all
    @State private var showingCreateMove = false
    @State private var selectedMove: Move?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search moves...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(MoveFilter.allCases, id: \.self) { filter in
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
                    ProgressView("Loading moves...")
                    Spacer()
                } else if filteredMoves.isEmpty {
                    EmptyStateView(
                        icon: "truck.box",
                        title: "No Moves Found",
                        message: selectedFilter == .all ? "Create your first move to get started" : "No moves match your current filter"
                    )
                } else {
                    List {
                        ForEach(filteredMoves) { move in
                            MoveRowView(move: move) {
                                selectedMove = move
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Moves")
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
                CreateMoveView()
            }
            .sheet(item: $selectedMove) { move in
                MoveDetailView(move: move)
            }
        }
    }
    
    private var filteredMoves: [Move] {
        var moves = viewModel.moves
        
        // Apply filter
        switch selectedFilter {
        case .all:
            break
        case .active:
            moves = moves.filter { $0.status.lowercased() == "in_progress" }
        case .pending:
            moves = moves.filter { $0.status.lowercased() == "pending" }
        case .completed:
            moves = moves.filter { $0.status.lowercased() == "completed" }
        case .draft:
            moves = moves.filter { $0.status.lowercased() == "draft" }
        }
        
        // Apply search
        if !searchText.isEmpty {
            moves = moves.filter { move in
                move.name.localizedCaseInsensitiveContains(searchText) ||
                move.description?.localizedCaseInsensitiveContains(searchText) == true ||
                move.moveType.localizedCaseInsensitiveContains(searchText) ||
                move.fromAddress?.city.localizedCaseInsensitiveContains(searchText) == true ||
                move.toAddress?.city.localizedCaseInsensitiveContains(searchText) == true
            }
        }
        
        return moves
    }
}

// MARK: - Supporting Views
struct MoveRowView: View {
    let move: Move
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // Status Icon
                Circle()
                    .fill(statusColor.opacity(0.1))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "truck.box.fill")
                            .foregroundColor(statusColor)
                            .font(.title3)
                    )
                
                // Move Details
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(move.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        StatusBadge(status: move.status)
                    }
                    
                    Text(move.moveType.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    // Address Information
                    VStack(alignment: .leading, spacing: 4) {
                        if let fromAddress = move.fromAddress {
                            HStack {
                                Image(systemName: "location.fill")
                                    .foregroundColor(.blue)
                                    .font(.caption)
                                Text("From: \(fromAddress.city), \(fromAddress.state)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                        
                        if let toAddress = move.toAddress {
                            HStack {
                                Image(systemName: "location")
                                    .foregroundColor(.green)
                                    .font(.caption)
                                Text("To: \(toAddress.city), \(toAddress.state)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                    }
                    
                    // Move Stats
                    HStack(spacing: 16) {
                        MoveStatView(
                            icon: "cube.box.fill",
                            value: "\(move.items.count)",
                            label: "Items"
                        )
                        
                        MoveStatView(
                            icon: "checklist",
                            value: "\(move.tasks.count)",
                            label: "Tasks"
                        )
                        
                        if let startDate = move.startDate {
                            MoveStatView(
                                icon: "calendar",
                                value: formatDate(startDate),
                                label: "Start"
                            )
                        }
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

struct StatusBadge: View {
    let status: String
    
    var body: some View {
        Text(status.capitalized)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.1))
            .cornerRadius(8)
    }
    
    private var statusColor: Color {
        switch status.lowercased() {
        case "draft": return .gray
        case "pending": return .orange
        case "in_progress": return .blue
        case "completed": return .green
        case "cancelled": return .red
        default: return .gray
        }
    }
}

struct MoveStatView: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(.secondary)
            
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

struct FilterPill: View {
    let title: String
    let isSelected: Bool
    let count: Int
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("(\(count))")
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundColor(isSelected ? .white : .primary)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.blue : Color(.systemGray6))
            .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Move Filter
enum MoveFilter: CaseIterable {
    case all
    case active
    case pending
    case completed
    case draft
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .pending: return "Pending"
        case .completed: return "Completed"
        case .draft: return "Draft"
        }
    }
}

// MARK: - View Model
class MoveListViewModel: ObservableObject {
    @Published var moves: [Move] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadMoves() async {
        isLoading = true
        errorMessage = nil
        
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
            
            self.moves = moves
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func moveCount(for filter: MoveFilter) -> Int {
        switch filter {
        case .all:
            return moves.count
        case .active:
            return moves.filter { $0.status.lowercased() == "in_progress" }.count
        case .pending:
            return moves.filter { $0.status.lowercased() == "pending" }.count
        case .completed:
            return moves.filter { $0.status.lowercased() == "completed" }.count
        case .draft:
            return moves.filter { $0.status.lowercased() == "draft" }.count
        }
    }
}

// MARK: - Placeholder Views
struct CreateMoveView: View {
    var body: some View {
        NavigationView {
            Text("Create Move View")
                .navigationTitle("New Move")
        }
    }
}

struct MoveDetailView: View {
    let move: Move
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Move Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(statusColor.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "truck.box.fill")
                                        .foregroundColor(statusColor)
                                        .font(.title2)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(move.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text(move.moveType.capitalized)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            StatusBadge(status: move.status)
                        }
                        
                        if let description = move.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Addresses
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Addresses")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        if let fromAddress = move.fromAddress {
                            AddressCard(
                                title: "From",
                                address: fromAddress,
                                icon: "location.fill",
                                color: .blue
                            )
                        }
                        
                        if let toAddress = move.toAddress {
                            AddressCard(
                                title: "To",
                                address: toAddress,
                                icon: "location",
                                color: .green
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Stats
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Move Statistics")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                            StatCard(
                                title: "Items",
                                value: "\(move.items.count)",
                                icon: "cube.box.fill",
                                color: .blue
                            )
                            
                            StatCard(
                                title: "Tasks",
                                value: "\(move.tasks.count)",
                                icon: "checklist",
                                color: .orange
                            )
                            
                            StatCard(
                                title: "Stops",
                                value: "\(move.stops.count)",
                                icon: "mappin.circle.fill",
                                color: .purple
                            )
                            
                            StatCard(
                                title: "Layouts",
                                value: "\(move.layouts.count)",
                                icon: "square.grid.2x2.fill",
                                color: .green
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Move Details")
            .navigationBarTitleDisplayMode(.inline)
        }
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

struct AddressCard: View {
    let title: String
    let address: Address
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.subheadline)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            Text(address.fullAddress)
                .font(.body)
                .foregroundColor(.secondary)
            
            if let instructions = address.specialInstructions {
                Text("Special Instructions: \(instructions)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    MoveListView()
} 