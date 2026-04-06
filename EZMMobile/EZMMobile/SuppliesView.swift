import SwiftUI

struct SuppliesView: View {
    @StateObject private var viewModel = SuppliesViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: SupplyFilter = .all
    @State private var showingAddSupply = false
    @State private var selectedSupply: Supply?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search supplies...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(SupplyFilter.allCases, id: \.self) { filter in
                                FilterPill(
                                    title: filter.displayName,
                                    isSelected: selectedFilter == filter,
                                    count: viewModel.supplyCount(for: filter)
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
                
                // Supplies List
                if viewModel.isLoading {
                    Spacer()
                    ProgressView("Loading supplies...")
                    Spacer()
                } else if filteredSupplies.isEmpty {
                    EmptyStateView(
                        icon: "cube.box",
                        title: "No Supplies Found",
                        message: selectedFilter == .all ? "Add your first supply to get started" : "No supplies match your current filter"
                    )
                } else {
                    List {
                        ForEach(filteredSupplies) { supply in
                            SupplyRowView(supply: supply) {
                                selectedSupply = supply
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Supplies")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddSupply = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadSupplies()
            }
            .onAppear {
                Task {
                    await viewModel.loadSupplies()
                }
            }
            .sheet(isPresented: $showingAddSupply) {
                AddSupplyView()
            }
            .sheet(item: $selectedSupply) { supply in
                SupplyDetailView(supply: supply)
            }
        }
    }
    
    private var filteredSupplies: [Supply] {
        var supplies = viewModel.supplies
        
        // Apply filter
        switch selectedFilter {
        case .all:
            break
        case .lowStock:
            supplies = supplies.filter { supply in
                if let quantity = supply.quantity, let minQuantity = supply.minQuantity {
                    return quantity <= minQuantity
                }
                return false
            }
        case .outOfStock:
            supplies = supplies.filter { supply in
                supply.quantity == nil || supply.quantity == 0
            }
        case .inStock:
            supplies = supplies.filter { supply in
                supply.quantity != nil && supply.quantity! > 0
            }
        }
        
        // Apply search
        if !searchText.isEmpty {
            supplies = supplies.filter { supply in
                supply.name.localizedCaseInsensitiveContains(searchText) ||
                supply.description?.localizedCaseInsensitiveContains(searchText) == true ||
                supply.type?.localizedCaseInsensitiveContains(searchText) == true
            }
        }
        
        return supplies
    }
}

// MARK: - Supporting Views
struct SupplyRowView: View {
    let supply: Supply
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // Supply Icon
                Circle()
                    .fill(stockColor.opacity(0.1))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "cube.box.fill")
                            .foregroundColor(stockColor)
                            .font(.title3)
                    )
                
                // Supply Details
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(supply.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        StockBadge(supply: supply)
                    }
                    
                    if let description = supply.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    
                    // Supply Info
                    VStack(alignment: .leading, spacing: 4) {
                        if let type = supply.type {
                            HStack {
                                Image(systemName: "tag.fill")
                                    .foregroundColor(.blue)
                                    .font(.caption)
                                Text("Type: \(type)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        HStack {
                            Image(systemName: "building.2.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                            Text("Company: \(supply.company.name)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Stock Information
                    HStack(spacing: 16) {
                        SupplyStatView(
                            icon: "number.circle.fill",
                            value: supply.quantity.map { "\($0)" } ?? "N/A",
                            label: "Quantity",
                            color: stockColor
                        )
                        
                        if let unit = supply.unit {
                            SupplyStatView(
                                icon: "ruler.fill",
                                value: unit,
                                label: "Unit",
                                color: .gray
                            )
                        }
                        
                        if let minQuantity = supply.minQuantity {
                            SupplyStatView(
                                icon: "exclamationmark.triangle.fill",
                                value: "\(minQuantity)",
                                label: "Min",
                                color: .orange
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
    
    private var stockColor: Color {
        guard let quantity = supply.quantity else { return .gray }
        
        if quantity == 0 {
            return .red
        } else if let minQuantity = supply.minQuantity, quantity <= minQuantity {
            return .orange
        } else {
            return .green
        }
    }
}

struct StockBadge: View {
    let supply: Supply
    
    var body: some View {
        Text(stockStatus)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(stockColor)
            .cornerRadius(8)
    }
    
    private var stockStatus: String {
        guard let quantity = supply.quantity else { return "Unknown" }
        
        if quantity == 0 {
            return "Out of Stock"
        } else if let minQuantity = supply.minQuantity, quantity <= minQuantity {
            return "Low Stock"
        } else {
            return "In Stock"
        }
    }
    
    private var stockColor: Color {
        guard let quantity = supply.quantity else { return .gray }
        
        if quantity == 0 {
            return .red
        } else if let minQuantity = supply.minQuantity, quantity <= minQuantity {
            return .orange
        } else {
            return .green
        }
    }
}

struct SupplyStatView: View {
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

// MARK: - Supply Filter
enum SupplyFilter: CaseIterable {
    case all
    case lowStock
    case outOfStock
    case inStock
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .lowStock: return "Low Stock"
        case .outOfStock: return "Out of Stock"
        case .inStock: return "In Stock"
        }
    }
}

// MARK: - View Model
class SuppliesViewModel: ObservableObject {
    @Published var supplies: [Supply] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService()
    
    @MainActor
    func loadSupplies() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let supplies = try await withCheckedThrowingContinuation { continuation in
                apiService.getSupplies()
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                continuation.resume(throwing: error)
                            }
                        },
                        receiveValue: { supplies in
                            continuation.resume(returning: supplies)
                        }
                    )
                    .store(in: &Set<AnyCancellable>())
            }
            
            self.supplies = supplies
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func supplyCount(for filter: SupplyFilter) -> Int {
        switch filter {
        case .all:
            return supplies.count
        case .lowStock:
            return supplies.filter { supply in
                if let quantity = supply.quantity, let minQuantity = supply.minQuantity {
                    return quantity <= minQuantity
                }
                return false
            }.count
        case .outOfStock:
            return supplies.filter { supply in
                supply.quantity == nil || supply.quantity == 0
            }.count
        case .inStock:
            return supplies.filter { supply in
                supply.quantity != nil && supply.quantity! > 0
            }.count
        }
    }
}

// MARK: - Placeholder Views
struct AddSupplyView: View {
    var body: some View {
        NavigationView {
            Text("Add Supply View")
                .navigationTitle("New Supply")
        }
    }
}

struct SupplyDetailView: View {
    let supply: Supply
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Supply Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(stockColor.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "cube.box.fill")
                                        .foregroundColor(stockColor)
                                        .font(.title2)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(supply.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                if let type = supply.type {
                                    Text("Type: \(type)")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                            
                            StockBadge(supply: supply)
                        }
                        
                        if let description = supply.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Supply Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Supply Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            DetailRow(
                                title: "Quantity",
                                value: supply.quantity.map { "\($0)" } ?? "Not specified",
                                icon: "number.circle.fill",
                                color: stockColor
                            )
                            
                            if let unit = supply.unit {
                                DetailRow(
                                    title: "Unit",
                                    value: unit,
                                    icon: "ruler.fill",
                                    color: .blue
                                )
                            }
                            
                            if let minQuantity = supply.minQuantity {
                                DetailRow(
                                    title: "Minimum Quantity",
                                    value: "\(minQuantity)",
                                    icon: "exclamationmark.triangle.fill",
                                    color: .orange
                                )
                            }
                            
                            DetailRow(
                                title: "Company",
                                value: supply.company.name,
                                icon: "building.2.fill",
                                color: .green
                            )
                            
                            DetailRow(
                                title: "Created",
                                value: formatDate(supply.createdAt),
                                icon: "clock.fill",
                                color: .gray
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Stock Status
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Stock Status")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        VStack(spacing: 12) {
                            StockStatusRow(
                                title: "Current Stock",
                                value: supply.quantity.map { "\($0)" } ?? "Unknown",
                                color: stockColor
                            )
                            
                            if let minQuantity = supply.minQuantity {
                                StockStatusRow(
                                    title: "Reorder Point",
                                    value: "\(minQuantity)",
                                    color: .orange
                                )
                                
                                if let quantity = supply.quantity {
                                    let remaining = quantity - minQuantity
                                    StockStatusRow(
                                        title: "Remaining Above Min",
                                        value: "\(remaining)",
                                        color: remaining > 0 ? .green : .red
                                    )
                                }
                            }
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
                                title: "Update Stock",
                                icon: "plus.circle.fill",
                                style: .primary
                            ) {
                                // Implement stock update
                            }
                            
                            CustomButton(
                                title: "Edit Supply",
                                icon: "pencil",
                                style: .outline
                            ) {
                                // Navigate to edit supply
                            }
                            
                            CustomButton(
                                title: "Delete Supply",
                                icon: "trash",
                                style: .destructive
                            ) {
                                // Implement delete supply
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Supply Details")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var stockColor: Color {
        guard let quantity = supply.quantity else { return .gray }
        
        if quantity == 0 {
            return .red
        } else if let minQuantity = supply.minQuantity, quantity <= minQuantity {
            return .orange
        } else {
            return .green
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

struct StockStatusRow: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(color)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SuppliesView()
} 