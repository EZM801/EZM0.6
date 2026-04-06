import Foundation

// MARK: - User Models
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String?
    let lastName: String?
    let accountType: String
    let role: String?
    let companyId: String?
    let userType: String
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
    let phoneNumber: String?
    let companyCode: String?
    let emailVerified: String?
    let failedLoginAttempts: Int
    let lastLoginAttempt: String?
    let isVerified: Bool
    
    var fullName: String {
        let first = firstName ?? ""
        let last = lastName ?? ""
        return "\(first) \(last)".trimmingCharacters(in: .whitespaces)
    }
}

// MARK: - Company Models
struct Company: Codable, Identifiable {
    let id: String
    let name: String
    let address: String?
    let phoneNumber: String?
    let companyCode: String
    let businessType: String?
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
}

// MARK: - Move Models
struct Move: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let status: String
    let userId: String
    let companyId: String?
    let createdAt: String
    let updatedAt: String
    let startDate: String?
    let endDate: String?
    let moveType: String
    let isTemplate: Bool
    let templateName: String?
    let templateCategory: String?
    let visibility: String
    let fromAddressId: String?
    let toAddressId: String?
    let fromAddress: Address?
    let toAddress: Address?
    let stops: [MoveStop]
    let items: [Item]
    let tasks: [Task]
    let layouts: [Layout]
    
    var statusColor: String {
        switch status.lowercased() {
        case "draft": return "gray"
        case "pending": return "orange"
        case "in_progress": return "blue"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }
}

// MARK: - Address Models
struct Address: Codable, Identifiable {
    let id: String
    let street: String
    let city: String
    let state: String
    let zipCode: String
    let country: String
    let hasElevator: Bool
    let floorNumber: Int?
    let specialInstructions: String?
    let createdAt: String
    let updatedAt: String
    
    var fullAddress: String {
        var address = street
        if let floor = floorNumber {
            address += ", Floor \(floor)"
        }
        address += ", \(city), \(state) \(zipCode)"
        return address
    }
}

// MARK: - Move Stop Models
struct MoveStop: Codable, Identifiable {
    let id: String
    let moveId: String
    let name: String
    let address: String
    let city: String
    let state: String
    let zipCode: String
    let country: String
    let arrivalDate: String?
    let departureDate: String?
    let notes: String?
    let createdAt: String
    let updatedAt: String
    let addressId: String?
    let addressDetails: Address?
    
    var fullAddress: String {
        return "\(address), \(city), \(state) \(zipCode)"
    }
}

// MARK: - Item Models
struct Item: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let weight: Double?
    let value: Double?
    let isFragile: Bool
    let specialInstructions: String?
    let originRoomId: String?
    let destinationRoomId: String?
    let stopRoomId: String?
    let createdAt: String
    let updatedAt: String
    let itemListId: String
    let moveId: String?
    let moveStopId: String?
    let packingStatus: String?
    let qrCode: String?
    let originRoom: Room?
    let destinationRoom: Room?
    let stopRoom: Room?
    let photos: [ItemPhoto]
    
    var statusColor: String {
        switch packingStatus?.lowercased() {
        case "unpacked": return "red"
        case "packed": return "orange"
        case "loaded": return "blue"
        case "unloaded": return "green"
        default: return "gray"
        }
    }
}

// MARK: - Item Photo Models
struct ItemPhoto: Codable, Identifiable {
    let id: String
    let url: String
    let description: String?
    let mimeType: String
    let size: Int
    let isPrimary: Bool
    let itemId: String
    let createdAt: String
    let updatedAt: String
}

// MARK: - Item List Models
struct ItemList: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let moveId: String
    let createdAt: String
    let updatedAt: String
    let items: [Item]
}

// MARK: - Layout Models
struct Layout: Codable, Identifiable {
    let id: String
    let name: String
    let instructions: String?
    let moveId: String?
    let moveStopId: String?
    let orientation: String
    let createdAt: String
    let updatedAt: String
    let rooms: [Room]
}

// MARK: - Room Models
struct Room: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let layoutId: String
    let createdAt: String
    let updatedAt: String
    let originItems: [Item]
    let destinationItems: [Item]
    let stopItems: [Item]
}

// MARK: - Task Models
struct Task: Codable, Identifiable {
    let id: String
    let description: String?
    let status: String
    let priority: String
    let dueDate: String?
    let moveId: String
    let userId: String
    let assignedTo: String?
    let createdAt: String
    let updatedAt: String
    let name: String
    let createdBy: User
    let assignedToUser: User?
    
    var priorityColor: String {
        switch priority.lowercased() {
        case "low": return "green"
        case "normal": return "blue"
        case "high": return "orange"
        case "urgent": return "red"
        default: return "blue"
        }
    }
    
    var statusColor: String {
        switch status.lowercased() {
        case "pending": return "gray"
        case "in_progress": return "blue"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }
}

// MARK: - Equipment Models
struct Equipment: Codable, Identifiable {
    let id: String
    let companyId: String
    let name: String
    let type: String
    let description: String?
    let isAvailable: Bool
    let imageUrl: String?
    let qrCode: String?
    let status: String
    let createdAt: String
    let updatedAt: String
    let company: Company
}

// MARK: - Supply Models
struct Supply: Codable, Identifiable {
    let id: String
    let companyId: String
    let name: String
    let type: String?
    let quantity: Int?
    let unit: String?
    let minQuantity: Int?
    let createdAt: String
    let updatedAt: String
    let company: Company
}

// MARK: - Vehicle Models
struct Vehicle: Codable, Identifiable {
    let id: String
    let companyId: String
    let name: String
    let type: String
    let licensePlate: String
    let capacity: Int
    let isAvailable: Bool
    let createdAt: String
    let updatedAt: String
    let company: Company
}

// MARK: - QR Code Models
struct QRCode: Codable, Identifiable {
    let id: String
    let code: String
    let moveId: String
    let itemId: String?
    let createdAt: String
    let updatedAt: String
    let move: Move
    let item: Item?
}

// MARK: - Contact Models
struct Contact: Codable, Identifiable {
    let id: String
    let firstName: String
    let lastName: String
    let email: String
    let phoneNumber: String
    let type: String
    let notes: String?
    let isActive: Bool
    let userId: String
    let createdAt: String
    let updatedAt: String
    
    var fullName: String {
        return "\(firstName) \(lastName)"
    }
}

// MARK: - Company Move Models (for company accounts)
struct CompanyMove: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let moveType: String
    let status: String
    let startDate: String
    let endDate: String?
    let clientName: String
    let clientEmail: String
    let clientPhone: String
    let estimatedBudget: Double?
    let priority: String
    let specialInstructions: String?
    let companyId: String
    let createdById: String
    let createdAt: String
    let updatedAt: String
    let fromAddressId: String
    let toAddressId: String
    let fromAddress: Address?
    let toAddress: Address?
    let tasks: [CompanyMoveTask]
    let layouts: [CompanyMoveLayout]
    let itemLists: [CompanyItemList]
    let employees: [CompanyMoveEmployee]
    let vehicles: [CompanyMoveVehicle]
    let equipment: [CompanyMoveEquipment]
    let supplies: [CompanyMoveSupply]
    
    var statusColor: String {
        switch status.lowercased() {
        case "pending": return "orange"
        case "in_progress": return "blue"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }
    
    var priorityColor: String {
        switch priority.lowercased() {
        case "low": return "green"
        case "medium": return "orange"
        case "high": return "red"
        default: return "gray"
        }
    }
}

// MARK: - Company Item Models
struct CompanyItem: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let weight: Double?
    let value: Double?
    let isFragile: Bool
    let specialInstructions: String?
    let originRoomId: String?
    let destinationRoomId: String?
    let stopRoomId: String?
    let createdAt: String
    let updatedAt: String
    let itemListId: String
    let packingStatus: String
    let qrCode: String?
    let originRoom: CompanyRoom?
    let destinationRoom: CompanyRoom?
    let stopRoom: CompanyRoom?
    let photos: [CompanyItemPhoto]
}

// MARK: - Company Item List Models
struct CompanyItemList: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let moveId: String
    let createdAt: String
    let updatedAt: String
    let items: [CompanyItem]
}

// MARK: - Company Item Photo Models
struct CompanyItemPhoto: Codable, Identifiable {
    let id: String
    let url: String
    let description: String?
    let mimeType: String
    let size: Int
    let isPrimary: Bool
    let itemId: String
    let createdAt: String
    let updatedAt: String
}

// MARK: - Company Move Layout Models
struct CompanyMoveLayout: Codable, Identifiable {
    let id: String
    let name: String
    let instructions: String?
    let moveId: String
    let orientation: String
    let createdAt: String
    let updatedAt: String
    let rooms: [CompanyRoom]
}

// MARK: - Company Room Models
struct CompanyRoom: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let layoutId: String
    let createdAt: String
    let updatedAt: String
}

// MARK: - Company Move Task Models
struct CompanyMoveTask: Codable, Identifiable {
    let id: String
    let moveId: String
    let name: String
    let description: String?
    let status: String
    let priority: String
    let startDate: String?
    let endDate: String?
    let createdAt: String
    let updatedAt: String
    let assignedToId: String?
    let assignedTo: Employee?
    
    var statusColor: String {
        switch status.lowercased() {
        case "todo": return "gray"
        case "in_progress": return "blue"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }
}

// MARK: - Employee Models
struct Employee: Codable, Identifiable {
    let id: String
    let companyId: String
    let name: String
    let email: String
    let phone: String?
    let role: String
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
}

// MARK: - Company Move Employee Models
struct CompanyMoveEmployee: Codable, Identifiable {
    let id: String
    let moveId: String
    let employeeId: String
    let role: String
    let startDate: String
    let endDate: String?
    let createdAt: String
    let updatedAt: String
    let employee: Employee?
}

// MARK: - Company Move Vehicle Models
struct CompanyMoveVehicle: Codable, Identifiable {
    let id: String
    let moveId: String
    let vehicleId: String
    let startDate: String
    let endDate: String?
    let createdAt: String
    let updatedAt: String
    let vehicle: Vehicle?
}

// MARK: - Company Move Equipment Models
struct CompanyMoveEquipment: Codable, Identifiable {
    let id: String
    let moveId: String
    let equipmentId: String
    let quantity: Int
    let startDate: String
    let endDate: String?
    let createdAt: String
    let updatedAt: String
    let equipment: Equipment?
}

// MARK: - Company Move Supply Models
struct CompanyMoveSupply: Codable, Identifiable {
    let id: String
    let moveId: String
    let supplyId: String
    let quantity: Int
    let createdAt: String
    let updatedAt: String
    let supply: Supply?
}

// MARK: - API Response Models
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: APIError?
}

struct APIError: Codable {
    let message: String
    let code: String?
}

// MARK: - Authentication Models
struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct SignupRequest: Codable {
    let email: String
    let password: String
    let firstName: String?
    let lastName: String?
    let accountType: String
    let companyCode: String?
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}

// MARK: - Create Move Request
struct CreateMoveRequest: Codable {
    let name: String
    let description: String?
    let moveType: String?
    let startDate: String?
    let endDate: String?
    let fromAddress: AddressRequest?
    let toAddress: AddressRequest?
    let stops: [MoveStopRequest]?
}

struct AddressRequest: Codable {
    let street: String
    let city: String
    let state: String
    let zipCode: String
    let hasElevator: Bool?
    let floorNumber: Int?
    let specialInstructions: String?
}

struct MoveStopRequest: Codable {
    let name: String?
    let street: String
    let city: String
    let state: String
    let zipCode: String
    let country: String?
    let arrivalDate: String?
    let departureDate: String?
    let notes: String?
}

// MARK: - Create Item Request
struct CreateItemRequest: Codable {
    let name: String
    let description: String?
    let weight: Double?
    let value: Double?
    let isFragile: Bool?
    let specialInstructions: String?
    let itemListId: String
    let originRoomId: String?
    let destinationRoomId: String?
    let stopRoomId: String?
    let packingStatus: String?
}

// MARK: - Create Task Request
struct CreateTaskRequest: Codable {
    let name: String
    let description: String?
    let status: String?
    let priority: String?
    let dueDate: String?
    let moveId: String
    let assignedTo: String?
}

// MARK: - Enums
enum MoveType: String, CaseIterable {
    case residential = "residential"
    case commercial = "commercial"
    case storage = "storage"
    case packing = "packing"
    case unpacking = "unpacking"
    
    var displayName: String {
        switch self {
        case .residential: return "Residential"
        case .commercial: return "Commercial"
        case .storage: return "Storage"
        case .packing: return "Packing"
        case .unpacking: return "Unpacking"
        }
    }
}

enum MoveStatus: String, CaseIterable {
    case draft = "draft"
    case pending = "pending"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .draft: return "Draft"
        case .pending: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case low = "low"
    case normal = "normal"
    case high = "high"
    case urgent = "urgent"
    
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .normal: return "Normal"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
}

enum TaskStatus: String, CaseIterable {
    case pending = "pending"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

enum PackingStatus: String, CaseIterable {
    case unpacked = "unpacked"
    case packed = "packed"
    case loaded = "loaded"
    case unloaded = "unloaded"
    
    var displayName: String {
        switch self {
        case .unpacked: return "Unpacked"
        case .packed: return "Packed"
        case .loaded: return "Loaded"
        case .unloaded: return "Unloaded"
        }
    }
}

// MARK: - Company Request Models
struct CreateCompanyItemRequest: Codable {
    let name: String
    let description: String?
    let weight: Double?
    let value: Double?
    let isFragile: Bool
    let specialInstructions: String?
    let originRoomId: String?
    let destinationRoomId: String?
    let stopRoomId: String?
    let itemListId: String
    let packingStatus: String
}

struct CreateCompanyMoveTaskRequest: Codable {
    let name: String
    let description: String?
    let status: String
    let priority: String
    let startDate: String?
    let endDate: String?
    let assignedToId: String?
}

struct CreateCompanyLayoutRequest: Codable {
    let name: String
    let instructions: String?
    let orientation: String
}

struct CreateCompanyItemListRequest: Codable {
    let name: String
    let description: String?
}

struct AssignEmployeeRequest: Codable {
    let employeeId: String
    let role: String
    let startDate: String
    let endDate: String?
}

struct AssignVehicleRequest: Codable {
    let vehicleId: String
    let startDate: String
    let endDate: String?
}

struct AssignEquipmentRequest: Codable {
    let equipmentId: String
    let quantity: Int
    let startDate: String
    let endDate: String?
}

struct AssignSupplyRequest: Codable {
    let supplyId: String
    let quantity: Int
}

struct UpdateSupplyQuantityRequest: Codable {
    let quantity: Int
}

// MARK: - Company Enums
enum CompanyMoveStatus: String, CaseIterable {
    case pending = "PENDING"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    
    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

enum CompanyMovePriority: String, CaseIterable {
    case low = "LOW"
    case medium = "MEDIUM"
    case high = "HIGH"
    case urgent = "URGENT"
    
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
}

enum CompanyTaskStatus: String, CaseIterable {
    case todo = "TODO"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    
    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

enum CompanyTaskPriority: String, CaseIterable {
    case low = "LOW"
    case medium = "MEDIUM"
    case high = "HIGH"
    case urgent = "URGENT"
    
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
}

enum CompanyPackingStatus: String, CaseIterable {
    case unpacked = "UNPACKED"
    case packed = "PACKED"
    case loaded = "LOADED"
    case unloaded = "UNLOADED"
    
    var displayName: String {
        switch self {
        case .unpacked: return "Unpacked"
        case .packed: return "Packed"
        case .loaded: return "Loaded"
        case .unloaded: return "Unloaded"
        }
    }
} 