import Foundation
import Combine

class APIService: ObservableObject {
    private let baseURL = "http://localhost:3000/api" // Change this to your actual API URL
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Authentication
    func login(email: String, password: String) -> AnyPublisher<AuthResponse, Error> {
        let request = LoginRequest(email: email, password: password)
        return post(endpoint: "/auth/login", body: request)
    }
    
    func signup(email: String, password: String, firstName: String?, lastName: String?, accountType: String, companyCode: String?) -> AnyPublisher<AuthResponse, Error> {
        let request = SignupRequest(email: email, password: password, firstName: firstName, lastName: lastName, accountType: accountType, companyCode: companyCode)
        return post(endpoint: "/auth/signup", body: request)
    }
    
    func logout() -> AnyPublisher<Void, Error> {
        return post(endpoint: "/auth/logout", body: EmptyRequest())
    }
    
    // MARK: - Moves
    func getMoves() -> AnyPublisher<[Move], Error> {
        return get(endpoint: "/moves")
    }
    
    func getMove(id: String) -> AnyPublisher<Move, Error> {
        return get(endpoint: "/moves/\(id)")
    }
    
    func createMove(_ move: CreateMoveRequest) -> AnyPublisher<Move, Error> {
        return post(endpoint: "/moves", body: move)
    }
    
    func updateMove(id: String, _ move: CreateMoveRequest) -> AnyPublisher<Move, Error> {
        return patch(endpoint: "/moves/\(id)", body: move)
    }
    
    func deleteMove(id: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/moves/\(id)")
    }
    
    // MARK: - Company Moves
    func getCompanyMoves() -> AnyPublisher<[CompanyMove], Error> {
        return get(endpoint: "/company-moves")
    }
    
    func getCompanyMove(id: String) -> AnyPublisher<CompanyMove, Error> {
        return get(endpoint: "/company-moves/\(id)")
    }
    
    func createCompanyMove(_ move: CreateCompanyMoveRequest) -> AnyPublisher<CompanyMove, Error> {
        return post(endpoint: "/company-moves", body: move)
    }
    
    func updateCompanyMove(id: String, _ move: CreateCompanyMoveRequest) -> AnyPublisher<CompanyMove, Error> {
        return patch(endpoint: "/company-moves/\(id)", body: move)
    }
    
    func deleteCompanyMove(id: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(id)")
    }
    
    // MARK: - Company Move Items
    func getCompanyMoveItems(moveId: String) -> AnyPublisher<[CompanyItem], Error> {
        return get(endpoint: "/company-moves/\(moveId)/items")
    }
    
    func createCompanyMoveItem(moveId: String, _ item: CreateCompanyItemRequest) -> AnyPublisher<CompanyItem, Error> {
        return post(endpoint: "/company-moves/\(moveId)/items", body: item)
    }
    
    func updateCompanyMoveItem(moveId: String, itemId: String, _ item: CreateCompanyItemRequest) -> AnyPublisher<CompanyItem, Error> {
        return patch(endpoint: "/company-moves/\(moveId)/items/\(itemId)", body: item)
    }
    
    func deleteCompanyMoveItem(moveId: String, itemId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/items/\(itemId)")
    }
    
    // MARK: - Company Move Tasks
    func getCompanyMoveTasks(moveId: String) -> AnyPublisher<[CompanyMoveTask], Error> {
        return get(endpoint: "/company-moves/\(moveId)/tasks")
    }
    
    func createCompanyMoveTask(moveId: String, _ task: CreateCompanyMoveTaskRequest) -> AnyPublisher<CompanyMoveTask, Error> {
        return post(endpoint: "/company-moves/\(moveId)/tasks", body: task)
    }
    
    func updateCompanyMoveTask(moveId: String, taskId: String, _ task: CreateCompanyMoveTaskRequest) -> AnyPublisher<CompanyMoveTask, Error> {
        return patch(endpoint: "/company-moves/\(moveId)/tasks/\(taskId)", body: task)
    }
    
    func deleteCompanyMoveTask(moveId: String, taskId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/tasks/\(taskId)")
    }
    
    // MARK: - Company Move Employees
    func getCompanyMoveEmployees(moveId: String) -> AnyPublisher<[CompanyMoveEmployee], Error> {
        return get(endpoint: "/company-moves/\(moveId)/employees")
    }
    
    func assignEmployeeToMove(moveId: String, employeeId: String, role: String, startDate: String, endDate: String?) -> AnyPublisher<CompanyMoveEmployee, Error> {
        let request = AssignEmployeeRequest(employeeId: employeeId, role: role, startDate: startDate, endDate: endDate)
        return post(endpoint: "/company-moves/\(moveId)/employees", body: request)
    }
    
    func removeEmployeeFromMove(moveId: String, employeeId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/employees/\(employeeId)")
    }
    
    // MARK: - Company Move Vehicles
    func getCompanyMoveVehicles(moveId: String) -> AnyPublisher<[CompanyMoveVehicle], Error> {
        return get(endpoint: "/company-moves/\(moveId)/vehicles")
    }
    
    func assignVehicleToMove(moveId: String, vehicleId: String, startDate: String, endDate: String?) -> AnyPublisher<CompanyMoveVehicle, Error> {
        let request = AssignVehicleRequest(vehicleId: vehicleId, startDate: startDate, endDate: endDate)
        return post(endpoint: "/company-moves/\(moveId)/vehicles", body: request)
    }
    
    func removeVehicleFromMove(moveId: String, vehicleId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/vehicles/\(vehicleId)")
    }
    
    // MARK: - Company Move Equipment
    func getCompanyMoveEquipment(moveId: String) -> AnyPublisher<[CompanyMoveEquipment], Error> {
        return get(endpoint: "/company-moves/\(moveId)/equipment")
    }
    
    func assignEquipmentToMove(moveId: String, equipmentId: String, quantity: Int, startDate: String, endDate: String?) -> AnyPublisher<CompanyMoveEquipment, Error> {
        let request = AssignEquipmentRequest(equipmentId: equipmentId, quantity: quantity, startDate: startDate, endDate: endDate)
        return post(endpoint: "/company-moves/\(moveId)/equipment", body: request)
    }
    
    func removeEquipmentFromMove(moveId: String, equipmentId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/equipment/\(equipmentId)")
    }
    
    // MARK: - Company Move Supplies
    func getCompanyMoveSupplies(moveId: String) -> AnyPublisher<[CompanyMoveSupply], Error> {
        return get(endpoint: "/company-moves/\(moveId)/supplies")
    }
    
    func assignSupplyToMove(moveId: String, supplyId: String, quantity: Int) -> AnyPublisher<CompanyMoveSupply, Error> {
        let request = AssignSupplyRequest(supplyId: supplyId, quantity: quantity)
        return post(endpoint: "/company-moves/\(moveId)/supplies", body: request)
    }
    
    func updateMoveSupplyQuantity(moveId: String, supplyId: String, quantity: Int) -> AnyPublisher<CompanyMoveSupply, Error> {
        let request = UpdateSupplyQuantityRequest(quantity: quantity)
        return patch(endpoint: "/company-moves/\(moveId)/supplies/\(supplyId)", body: request)
    }
    
    func removeSupplyFromMove(moveId: String, supplyId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/supplies/\(supplyId)")
    }
    
    // MARK: - Company Move Layouts
    func getCompanyMoveLayouts(moveId: String) -> AnyPublisher<[CompanyMoveLayout], Error> {
        return get(endpoint: "/company-moves/\(moveId)/layouts")
    }
    
    func createCompanyMoveLayout(moveId: String, _ layout: CreateCompanyLayoutRequest) -> AnyPublisher<CompanyMoveLayout, Error> {
        return post(endpoint: "/company-moves/\(moveId)/layouts", body: layout)
    }
    
    func updateCompanyMoveLayout(moveId: String, layoutId: String, _ layout: CreateCompanyLayoutRequest) -> AnyPublisher<CompanyMoveLayout, Error> {
        return patch(endpoint: "/company-moves/\(moveId)/layouts/\(layoutId)", body: layout)
    }
    
    func deleteCompanyMoveLayout(moveId: String, layoutId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/layouts/\(layoutId)")
    }
    
    // MARK: - Company Move Item Lists
    func getCompanyMoveItemLists(moveId: String) -> AnyPublisher<[CompanyItemList], Error> {
        return get(endpoint: "/company-moves/\(moveId)/item-lists")
    }
    
    func createCompanyMoveItemList(moveId: String, _ itemList: CreateCompanyItemListRequest) -> AnyPublisher<CompanyItemList, Error> {
        return post(endpoint: "/company-moves/\(moveId)/item-lists", body: itemList)
    }
    
    func updateCompanyMoveItemList(moveId: String, itemListId: String, _ itemList: CreateCompanyItemListRequest) -> AnyPublisher<CompanyItemList, Error> {
        return patch(endpoint: "/company-moves/\(moveId)/item-lists/\(itemListId)", body: itemList)
    }
    
    func deleteCompanyMoveItemList(moveId: String, itemListId: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/company-moves/\(moveId)/item-lists/\(itemListId)")
    }
    
    // MARK: - Items
    func getItems(moveId: String) -> AnyPublisher<[Item], Error> {
        return get(endpoint: "/moves/\(moveId)/items")
    }
    
    func getItem(id: String) -> AnyPublisher<Item, Error> {
        return get(endpoint: "/items/\(id)")
    }
    
    func createItem(_ item: CreateItemRequest) -> AnyPublisher<Item, Error> {
        return post(endpoint: "/items", body: item)
    }
    
    func updateItem(id: String, _ item: CreateItemRequest) -> AnyPublisher<Item, Error> {
        return patch(endpoint: "/items/\(id)", body: item)
    }
    
    func deleteItem(id: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/items/\(id)")
    }
    
    // MARK: - Item Lists
    func getItemLists(moveId: String) -> AnyPublisher<[ItemList], Error> {
        return get(endpoint: "/moves/\(moveId)/item-lists")
    }
    
    func createItemList(name: String, description: String?, moveId: String) -> AnyPublisher<ItemList, Error> {
        let request = CreateItemListRequest(name: name, description: description, moveId: moveId)
        return post(endpoint: "/item-lists", body: request)
    }
    
    // MARK: - Tasks
    func getTasks(moveId: String) -> AnyPublisher<[Task], Error> {
        return get(endpoint: "/moves/\(moveId)/tasks")
    }
    
    func getTask(id: String) -> AnyPublisher<Task, Error> {
        return get(endpoint: "/tasks/\(id)")
    }
    
    func createTask(_ task: CreateTaskRequest) -> AnyPublisher<Task, Error> {
        return post(endpoint: "/tasks", body: task)
    }
    
    func updateTask(id: String, _ task: CreateTaskRequest) -> AnyPublisher<Task, Error> {
        return patch(endpoint: "/tasks/\(id)", body: task)
    }
    
    func deleteTask(id: String) -> AnyPublisher<Void, Error> {
        return delete(endpoint: "/tasks/\(id)")
    }
    
    // MARK: - Layouts
    func getLayouts(moveId: String) -> AnyPublisher<[Layout], Error> {
        return get(endpoint: "/moves/\(moveId)/layouts")
    }
    
    func createLayout(name: String, instructions: String?, moveId: String, orientation: String) -> AnyPublisher<Layout, Error> {
        let request = CreateLayoutRequest(name: name, instructions: instructions, moveId: moveId, orientation: orientation)
        return post(endpoint: "/layouts", body: request)
    }
    
    // MARK: - Rooms
    func getRooms(layoutId: String) -> AnyPublisher<[Room], Error> {
        return get(endpoint: "/layouts/\(layoutId)/rooms")
    }
    
    func createRoom(name: String, description: String?, layoutId: String) -> AnyPublisher<Room, Error> {
        let request = CreateRoomRequest(name: name, description: description, layoutId: layoutId)
        return post(endpoint: "/rooms", body: request)
    }
    
    // MARK: - Equipment
    func getEquipment() -> AnyPublisher<[Equipment], Error> {
        return get(endpoint: "/equipment")
    }
    
    func createEquipment(name: String, type: String, description: String?) -> AnyPublisher<Equipment, Error> {
        let request = CreateEquipmentRequest(name: name, type: type, description: description)
        return post(endpoint: "/equipment", body: request)
    }
    
    // MARK: - Supplies
    func getSupplies() -> AnyPublisher<[Supply], Error> {
        return get(endpoint: "/supplies")
    }
    
    func createSupply(name: String, type: String?, quantity: Int?, unit: String?) -> AnyPublisher<Supply, Error> {
        let request = CreateSupplyRequest(name: name, type: type, quantity: quantity, unit: unit)
        return post(endpoint: "/supplies", body: request)
    }
    
    // MARK: - Vehicles
    func getVehicles() -> AnyPublisher<[Vehicle], Error> {
        return get(endpoint: "/vehicles")
    }
    
    func createVehicle(name: String, type: String, licensePlate: String, capacity: Int) -> AnyPublisher<Vehicle, Error> {
        let request = CreateVehicleRequest(name: name, type: type, licensePlate: licensePlate, capacity: capacity)
        return post(endpoint: "/vehicles", body: request)
    }
    
    // MARK: - QR Codes
    func generateQRCode(moveId: String, itemId: String?) -> AnyPublisher<QRCode, Error> {
        let request = GenerateQRCodeRequest(moveId: moveId, itemId: itemId)
        return post(endpoint: "/qr-code/generate", body: request)
    }
    
    func scanQRCode(code: String) -> AnyPublisher<QRCode, Error> {
        let request = ScanQRCodeRequest(code: code)
        return post(endpoint: "/qr-code/scan", body: request)
    }
    
    // MARK: - Contacts
    func getContacts() -> AnyPublisher<[Contact], Error> {
        return get(endpoint: "/contacts")
    }
    
    func createContact(firstName: String, lastName: String, email: String, phoneNumber: String, type: String, notes: String?) -> AnyPublisher<Contact, Error> {
        let request = CreateContactRequest(firstName: firstName, lastName: lastName, email: email, phoneNumber: phoneNumber, type: type, notes: notes)
        return post(endpoint: "/contacts", body: request)
    }
    
    // MARK: - User Profile
    func getUserProfile() -> AnyPublisher<User, Error> {
        return get(endpoint: "/user/profile")
    }
    
    func updateUserProfile(firstName: String?, lastName: String?, phoneNumber: String?) -> AnyPublisher<User, Error> {
        let request = UpdateUserRequest(firstName: firstName, lastName: lastName, phoneNumber: phoneNumber)
        return patch(endpoint: "/user/profile", body: request)
    }
    
    // MARK: - Company
    func getCompany() -> AnyPublisher<Company, Error> {
        return get(endpoint: "/company")
    }
    
    func getEmployees() -> AnyPublisher<[Employee], Error> {
        return get(endpoint: "/company/employees")
    }
    
    // MARK: - Generic HTTP Methods
    private func get<T: Codable>(endpoint: String) -> AnyPublisher<T, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<T>.self, decoder: JSONDecoder())
            .compactMap { response in
                if response.success {
                    return response.data
                } else {
                    throw APIError.serverError(response.error?.message ?? "Unknown error")
                }
            }
            .eraseToAnyPublisher()
    }
    
    private func post<T: Codable, U: Codable>(endpoint: String, body: T) -> AnyPublisher<U, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<U>.self, decoder: JSONDecoder())
            .compactMap { response in
                if response.success {
                    return response.data
                } else {
                    throw APIError.serverError(response.error?.message ?? "Unknown error")
                }
            }
            .eraseToAnyPublisher()
    }
    
    private func patch<T: Codable, U: Codable>(endpoint: String, body: T) -> AnyPublisher<U, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<U>.self, decoder: JSONDecoder())
            .compactMap { response in
                if response.success {
                    return response.data
                } else {
                    throw APIError.serverError(response.error?.message ?? "Unknown error")
                }
            }
            .eraseToAnyPublisher()
    }
    
    private func delete(endpoint: String) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map { _ in () }
            .eraseToAnyPublisher()
    }
}

// MARK: - Additional Request Models
struct EmptyRequest: Codable {}

struct CreateCompanyMoveRequest: Codable {
    let name: String
    let description: String?
    let moveType: String
    let startDate: String
    let endDate: String?
    let clientName: String
    let clientEmail: String
    let clientPhone: String
    let estimatedBudget: Double?
    let priority: String
    let specialInstructions: String?
    let fromAddress: AddressRequest
    let toAddress: AddressRequest
}

struct CreateItemListRequest: Codable {
    let name: String
    let description: String?
    let moveId: String
}

struct CreateLayoutRequest: Codable {
    let name: String
    let instructions: String?
    let moveId: String
    let orientation: String
}

struct CreateRoomRequest: Codable {
    let name: String
    let description: String?
    let layoutId: String
}

struct CreateEquipmentRequest: Codable {
    let name: String
    let type: String
    let description: String?
}

struct CreateSupplyRequest: Codable {
    let name: String
    let type: String?
    let quantity: Int?
    let unit: String?
}

struct CreateVehicleRequest: Codable {
    let name: String
    let type: String
    let licensePlate: String
    let capacity: Int
}

struct GenerateQRCodeRequest: Codable {
    let moveId: String
    let itemId: String?
}

struct ScanQRCodeRequest: Codable {
    let code: String
}

struct CreateContactRequest: Codable {
    let firstName: String
    let lastName: String
    let email: String
    let phoneNumber: String
    let type: String
    let notes: String?
}

struct UpdateUserRequest: Codable {
    let firstName: String?
    let lastName: String?
    let phoneNumber: String?
}

// MARK: - Custom Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case serverError(String)
    case networkError
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .serverError(let message):
            return message
        case .networkError:
            return "Network error occurred"
        case .decodingError:
            return "Failed to decode response"
        }
    }
} 