import SwiftUI

struct EquipmentView: View {
    @StateObject private var viewModel = EquipmentViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: EquipmentFilter = .all
    @State private var showingAddEquipment = false
    @State private var selectedEquipment: Equipment?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search equipment...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(EquipmentFilter.allCases, id: \.self) { filter in
                                FilterPill(
                                    title: filter.displayName,
                                    isSelected: selectedFilter == filter,
                                    count: viewModel.equipmentCount(for: filter)
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
                
                // Equipment List
                if viewModel.isLoading {
                    Spacer()
                    ProgressView("Loading equipment...")
                    Spacer()
                } else if filteredEquipment.isEmpty {
                    EmptyStateView(
                        icon: "wrench.and.screwdriver",
                        title: "No Equipment Found",
                        message: selectedFilter == .all ? "Add your first equipment to get started" : "No equipment match your current filter"
                    )
                } else {
                    List {
                        ForEach(filteredEquipment) { equipment in
                            EquipmentRowView(equipment: equipment) {
                                selectedEquipment = equipment
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Equipment")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddEquipment = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadEquipment()
            }
            .onAppear {
                Task {
                    await viewModel.loadEquipment()
                }
            }
            .sheet(isPresented: $showingAddEquipment) {
                AddEquipmentView()
            }
            .sheet(item: $selectedEquipment) { equipment in
                EquipmentDetailView(equipment: equipment)
            }
        }
    }
    
    private var filteredEquipment: [Equipment] {
        var equipment = viewModel.equipment
        
        // Apply filter
        switch selectedFilter {
        case .all:
            break
        case .available:
            equipment = equipment.filter { $0.isAvailable }
        case .inUse:
            equipment = equipment.filter { !$0.isAvailable }
        case .maintenance:
            equipment = equipment.filter { $0.status.lowercased() == "maintenance" }
        }
        
        // Apply search
        if !searchText.isEmpty {
            equipment = equipment.filter { eq in
                eq.name.localizedCaseInsensitiveContains(searchText) ||
                eq.description?.localizedCaseInsensitiveContains(searchText) == true ||
                eq.type.localizedCaseInsensitiveContains(searchText) ||
                eq.status.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return equipment
    }
}

// MARK: - Supporting Views
struct EquipmentRowView: View {
    let equipment: Equipment
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // Equipment Icon
                Circle()
                    .fill(statusColor.opacity(0.1))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "wrench.and.screwdriver.fill")
                            .foregroundColor(statusColor)
                            .font(.title3)
                    )
                
                // Equipment Details
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(equipment.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        AvailabilityBadge(equipment: equipment)
                    }
                    
                    if let description = equipment.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    
                    // Equipment Info
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: "tag.fill")
                                .foregroundColor(.blue)
                                .font(.caption)
                            Text("Type: \(equipment.type)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        HStack {
                            Image(systemName: "building.2.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text("Company: \(equipment.company.name)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Equipment Stats
                    HStack(spacing: 16) {
                        EquipmentStatView(
                            icon: "circle.fill",
                            value: equipment.status.capitalized,
                            label: "Status",
                            color: statusColor
                        )
                        
                        EquipmentStatView(
                            icon: "checkmark.circle.fill",
                            value: equipment.isAvailable ? "Available" : "In Use",
                            label: "Availability",
                            color: equipment.isAvailable ? .green : .orange
                        )
                        
                        if equipment.qrCode != nil {
                            EquipmentStatView(
                                icon: "qrcode",
                                value: "QR Code",
                                label: "Tracking",
                                color: .purple
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
        switch equipment.status.lowercased() {
        case "available": return .green
        case "in_use": return .orange
        case "maintenance": return .red
        case "out_of_service": return .gray
        default: return .blue
        }
    }
}

struct AvailabilityBadge: View {
    let equipment: Equipment
    
    var body: some View {
        Text(availabilityStatus)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(availabilityColor)
            .cornerRadius(8)
    }
    
    private var availabilityStatus: String {
        if equipment.isAvailable {
            return "Available"
        } else {
            return "In Use"
        }
    }
    
    private var availabilityColor: Color {
        if equipment.isAvailable {
            return .green
        } else {
            return .orange
        }
    }
}

struct EquipmentStatView: View {
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

// MARK: - Equipment Filter
enum EquipmentFilter: CaseIterable {
    case all
    case available
    case inUse
    case maintenance
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .available: return "Available"
        case .inUse: return "In Use"
        case .maintenance: return "Maintenance"
        }
    }
}

// MARK: - View Model
class EquipmentViewModel: ObservableObject {
    @Published var equipment: [Equipment] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadEquipment() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let equipment = try await withCheckedThrowingContinuation { continuation in
                apiService.getEquipment()
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { equipment in
                            continuation.resume(returning: equipment)
                        }
                    )
                    .store(in: &Set<AnyCancellable>())
            }
            
            self.equipment = equipment
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func equipmentCount(for filter: EquipmentFilter) -> Int {
        switch filter {
        case .all:
            return equipment.count
        case .available:
            return equipment.filter { $0.isAvailable }.count
        case .inUse:
            return equipment.filter { !$0.isAvailable }.count
        case .maintenance:
            return equipment.filter { $0.status.lowercased() == "maintenance" }.count
        }
    }
}

// MARK: - Placeholder Views
struct AddEquipmentView: View {
    var body: some View {
        NavigationView {
            Text("Add Equipment View")
                .navigationTitle("New Equipment")
        }
    }
}

struct EquipmentDetailView: View {
    let equipment: Equipment
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Equipment Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(statusColor.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "wrench.and.screwdriver.fill")
                                        .foregroundColor(statusColor)
                                        .font(.title2)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(equipment.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text("Type: \(equipment.type)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            AvailabilityBadge(equipment: equipment)
                        }
                        
                        if let description = equipment.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Equipment Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Equipment Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            DetailRow(
                                title: "Status",
                                value: equipment.status.capitalized,
                                icon: "circle.fill",
                                color: statusColor
                            )
                            
                            DetailRow(
                                title: "Availability",
                                value: equipment.isAvailable ? "Available" : "In Use",
                                icon: "checkmark.circle.fill",
                                color: equipment.isAvailable ? .green : .orange
                            )
                            
                            DetailRow(
                                title: "Company",
                                value: equipment.company.name,
                                icon: "building.2.fill",
                                color: .blue
                            )
                            
                            if let qrCode = equipment.qrCode {
                                DetailRow(
                                    title: "QR Code",
                                    value: qrCode,
                                    icon: "qrcode",
                                    color: .purple
                                )
                            }
                            
                            DetailRow(
                                title: "Created",
                                value: formatDate(equipment.createdAt),
                                icon: "clock.fill",
                                color: .gray
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Equipment Image (if available)
                    if let imageUrl = equipment.imageUrl {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Equipment Image")
                                .font(.headline)
                                .fontWeight(.semibold)
                            
                            AsyncImage(url: URL(string: imageUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle()
                                    .fill(Color.gray.opacity(0.3))
                                    .overlay(
                                        Image(systemName: "photo")
                                            .font(.largeTitle)
                                            .foregroundColor(.gray)
                                    )
                            }
                            .frame(height: 200)
                            .cornerRadius(12)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                    }
                    
                    // Actions
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Actions")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            CustomButton(
                                title: equipment.isAvailable ? "Mark as In Use" : "Mark as Available",
                                icon: equipment.isAvailable ? "pause.circle.fill" : "play.circle.fill",
                                style: .primary
                            ) {
                                // Implement availability toggle
                            }
                            
                            CustomButton(
                                title: "Mark for Maintenance",
                                icon: "wrench.and.screwdriver",
                                style: .outline
                            ) {
                                // Implement maintenance status
                            }
                            
                            CustomButton(
                                title: "Edit Equipment",
                                icon: "pencil",
                                style: .outline
                            ) {
                                // Navigate to edit equipment
                            }
                            
                            CustomButton(
                                title: "Delete Equipment",
                                icon: "trash",
                                style: .destructive
                            ) {
                                // Implement delete equipment
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Equipment Details")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var statusColor: Color {
        switch equipment.status.lowercased() {
        case "available": return .green
        case "in_use": return .orange
        case "maintenance": return .red
        case "out_of_service": return .gray
        default: return .blue
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

#Preview {
    EquipmentView()
} 