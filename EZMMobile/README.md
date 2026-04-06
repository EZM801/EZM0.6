# EZM0.5 iOS Mobile App

A comprehensive iOS mobile application built with SwiftUI for managing moving and relocation services. This app provides both individual and company account functionality with advanced features for move management, task tracking, resource allocation, and QR code scanning.

## Features

### 🔐 Authentication & User Management
- **Secure Login/Signup**: Email and password authentication
- **Account Types**: Support for individual and company accounts
- **Session Management**: Automatic token refresh and session validation
- **Profile Management**: User profile updates and settings

### 🏠 Individual Move Management
- **Move Creation**: Create and manage personal moves
- **Move Templates**: Save and reuse move templates
- **Status Tracking**: Track move progress (Draft, Pending, In Progress, Completed, Cancelled)
- **Address Management**: Store origin and destination addresses with special instructions
- **Item Management**: Add, edit, and track items with photos and QR codes
- **Task Management**: Create and assign tasks with priorities and due dates

### 🏢 Company Move Management
- **Company Moves**: Comprehensive company move management system
- **Client Information**: Store and manage client details
- **Resource Allocation**: Assign employees, vehicles, equipment, and supplies
- **Budget Tracking**: Monitor estimated and actual budgets
- **Priority Management**: Set and track move priorities
- **Multi-location Support**: Handle moves with multiple stops

### 👥 Employee Management
- **Employee Directory**: View and manage company employees
- **Role Assignment**: Assign roles to employees for specific moves
- **Contact Information**: Store employee contact details
- **Availability Tracking**: Monitor employee availability and assignments

### 🚛 Vehicle Management
- **Vehicle Inventory**: Track company vehicles
- **Capacity Management**: Monitor vehicle capacity and availability
- **Assignment Tracking**: Assign vehicles to specific moves
- **License Plate Tracking**: Store and manage vehicle registration

### 🛠️ Equipment Management
- **Equipment Inventory**: Track company equipment
- **Availability Status**: Monitor equipment availability
- **QR Code Integration**: Generate and scan equipment QR codes
- **Assignment Tracking**: Assign equipment to moves with quantities

### 📦 Supply Management
- **Supply Inventory**: Track company supplies
- **Quantity Management**: Monitor supply quantities and minimum levels
- **Assignment Tracking**: Assign supplies to moves
- **Unit Tracking**: Track supply units and measurements

### 📋 Task Management
- **Task Creation**: Create detailed tasks with descriptions
- **Priority Levels**: Set task priorities (Low, Normal, High, Urgent)
- **Status Tracking**: Track task progress (To Do, In Progress, Completed, Cancelled)
- **Assignment**: Assign tasks to specific employees
- **Due Date Management**: Set and track task due dates

### 📱 QR Code Integration
- **QR Code Generation**: Generate QR codes for items and equipment
- **QR Code Scanning**: Scan QR codes to track items and equipment
- **History Tracking**: Maintain scan history for audit purposes

### 🎨 Layout Management
- **Room Layouts**: Create and manage room layouts
- **Orientation Support**: Support for origin and destination layouts
- **Room Assignment**: Assign items to specific rooms
- **Visual Organization**: Organize items by room and layout

## Technical Architecture

### Frontend
- **SwiftUI**: Modern declarative UI framework
- **Combine**: Reactive programming for data flow
- **Async/Await**: Modern concurrency for network operations

### Backend Integration
- **RESTful API**: Full integration with EZM0.5 web API
- **Authentication**: JWT token-based authentication
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error handling and user feedback

### Data Management
- **Core Data**: Local data persistence (if needed)
- **UserDefaults**: Secure storage for user preferences and tokens
- **Network Layer**: Robust networking with retry logic and offline support

## Project Structure

```
EZMMobile/
├── EZMMobile/
│   ├── EZMMobileApp.swift          # Main app entry point
│   ├── ContentView.swift           # Root view with tab navigation
│   ├── LoginView.swift             # Authentication view
│   ├── DashboardView.swift         # Main dashboard
│   ├── MoveListView.swift          # Individual moves list
│   ├── CompanyMoveListView.swift   # Company moves list
│   ├── CompanyMoveDetailView.swift # Detailed company move view
│   ├── TaskListView.swift          # Task management
│   ├── EquipmentView.swift         # Equipment management
│   ├── SuppliesView.swift          # Supply management
│   ├── QRScannerView.swift         # QR code scanning
│   ├── ProfileView.swift           # User profile management
│   └── Components.swift            # Reusable UI components
├── Services/
│   ├── APIService.swift            # Network layer and API calls
│   ├── AuthManager.swift           # Authentication management
│   └── Models.swift                # Data models and structures
└── EZMMobile.xcodeproj/            # Xcode project files
```

## API Integration

The mobile app integrates with the EZM0.5 web API through the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Individual Moves
- `GET /api/moves` - Get user moves
- `POST /api/moves` - Create new move
- `PATCH /api/moves/{id}` - Update move
- `DELETE /api/moves/{id}` - Delete move

### Company Moves
- `GET /api/company-moves` - Get company moves
- `POST /api/company-moves` - Create company move
- `PATCH /api/company-moves/{id}` - Update company move
- `DELETE /api/company-moves/{id}` - Delete company move

### Resources
- `GET /api/company-moves/{id}/employees` - Get move employees
- `GET /api/company-moves/{id}/vehicles` - Get move vehicles
- `GET /api/company-moves/{id}/equipment` - Get move equipment
- `GET /api/company-moves/{id}/supplies` - Get move supplies
- `GET /api/company-moves/{id}/tasks` - Get move tasks
- `GET /api/company-moves/{id}/items` - Get move items
- `GET /api/company-moves/{id}/layouts` - Get move layouts

## Installation & Setup

### Prerequisites
- Xcode 14.0 or later
- iOS 16.0 or later
- Swift 5.7 or later

### Setup Instructions
1. Clone the repository
2. Open `EZMMobile.xcodeproj` in Xcode
3. Update the API base URL in `APIService.swift` to point to your backend
4. Build and run the project

### Configuration
- Update the `baseURL` in `APIService.swift` to match your backend URL
- Configure any additional environment variables as needed
- Set up proper certificates for production deployment

## Key Features Implementation

### Company Move Detail View
The `CompanyMoveDetailView` provides a comprehensive interface for managing company moves with:

- **Overview Tab**: Client information, addresses, and move statistics
- **Tasks Tab**: Task management with creation and assignment
- **Employees Tab**: Employee assignment and role management
- **Vehicles Tab**: Vehicle allocation and scheduling
- **Equipment Tab**: Equipment assignment with quantities
- **Supplies Tab**: Supply allocation and quantity tracking
- **Items Tab**: Item management with photos and QR codes
- **Layouts Tab**: Room layout management and organization

### Enhanced API Service
The `APIService` class provides:

- **Comprehensive Endpoints**: Full coverage of all API endpoints
- **Error Handling**: Robust error handling with user-friendly messages
- **Authentication**: Automatic token management and refresh
- **Request/Response Models**: Type-safe request and response handling

### Data Models
The `Models.swift` file includes:

- **User Models**: User and authentication data structures
- **Move Models**: Individual and company move structures
- **Resource Models**: Employee, vehicle, equipment, and supply models
- **Task Models**: Task management structures
- **Request Models**: API request structures
- **Enums**: Status and priority enumerations

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time notifications for move updates
- **Offline Support**: Offline data synchronization
- **Photo Management**: Enhanced photo upload and management
- **Reporting**: Move analytics and reporting features
- **Calendar Integration**: Integration with device calendar
- **Map Integration**: Location-based features and directions

### Technical Improvements
- **Core Data Integration**: Local data persistence
- **Background Sync**: Background data synchronization
- **Performance Optimization**: Improved app performance
- **Accessibility**: Enhanced accessibility features
- **Testing**: Comprehensive unit and UI testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository. 