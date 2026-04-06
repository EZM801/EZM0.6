import SwiftUI
import AVFoundation
import Combine

struct QRScannerView: View {
    @StateObject private var scannerViewModel = QRScannerViewModel()
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var showingScannedItem = false
    @State private var scannedItem: Item?
    @State private var showingCompanyInvite = false
    @State private var companyInviteCode = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                // Camera View
                CameraView(scannerViewModel: scannerViewModel)
                    .ignoresSafeArea()
                
                // Overlay
                VStack {
                    // Top Bar
                    HStack {
                        Button("Cancel") {
                            scannerViewModel.stopScanning()
                        }
                        .foregroundColor(.white)
                        .padding()
                        
                        Spacer()
                        
                        Text("Scan QR Code")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Button("Flash") {
                            scannerViewModel.toggleFlash()
                        }
                        .foregroundColor(.white)
                        .padding()
                    }
                    .background(Color.black.opacity(0.5))
                    
                    Spacer()
                    
                    // Scanning Frame
                    VStack(spacing: 20) {
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white, lineWidth: 3)
                            .frame(width: 250, height: 250)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(Color.blue, lineWidth: 1)
                                    .frame(width: 250, height: 250)
                            )
                        
                        Text("Position QR code within the frame")
                            .font(.subheadline)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    
                    Spacer()
                    
                    // Bottom Info
                    VStack(spacing: 12) {
                        Text("Supported QR Codes:")
                            .font(.caption)
                            .foregroundColor(.white)
                        
                        HStack(spacing: 20) {
                            QRCodeTypeBadge(type: "Item", color: .blue)
                            QRCodeTypeBadge(type: "Company", color: .green)
                            QRCodeTypeBadge(type: "Move", color: .orange)
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.5))
                }
                
                // Loading Overlay
                if scannerViewModel.isLoading {
                    Color.black.opacity(0.7)
                        .ignoresSafeArea()
                    
                    VStack(spacing: 16) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                        
                        Text("Processing QR Code...")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                }
            }
            .onAppear {
                scannerViewModel.startScanning()
            }
            .onDisappear {
                scannerViewModel.stopScanning()
            }
            .onReceive(scannerViewModel.$scannedCode) { code in
                if let code = code {
                    handleScannedCode(code)
                }
            }
            .onReceive(scannerViewModel.$error) { error in
                if let error = error {
                    alertMessage = error
                    showingAlert = true
                }
            }
            .alert("Scan Result", isPresented: $showingAlert) {
                Button("OK") { }
            } message: {
                Text(alertMessage)
            }
            .sheet(isPresented: $showingScannedItem) {
                if let item = scannedItem {
                    ScannedItemView(item: item)
                }
            }
            .sheet(isPresented: $showingCompanyInvite) {
                CompanyInviteView(code: companyInviteCode)
            }
        }
    }
    
    private func handleScannedCode(_ code: String) {
        // Determine the type of QR code and handle accordingly
        if code.hasPrefix("ITEM_") {
            // Item QR code
            handleItemQRCode(code)
        } else if code.hasPrefix("COMPANY_") {
            // Company invite QR code
            handleCompanyQRCode(code)
        } else if code.hasPrefix("MOVE_") {
            // Move QR code
            handleMoveQRCode(code)
        } else {
            // Unknown QR code format
            alertMessage = "Unknown QR code format: \(code)"
            showingAlert = true
        }
    }
    
    private func handleItemQRCode(_ code: String) {
        // Extract item ID from QR code
        let itemId = String(code.dropFirst(5)) // Remove "ITEM_" prefix
        
        Task {
            do {
                let item = try await withCheckedThrowingContinuation { continuation in
                    APIService().getItem(id: itemId)
                        .sink(
                            receiveCompletion: { completion in
                                if case .failure(let error) = completion {
                                    continuation.resume(throwing: error)
                                }
                            },
                            receiveValue: { item in
                                continuation.resume(returning: item)
                            }
                        )
                        .store(in: &Set<AnyCancellable>())
                }
                
                await MainActor.run {
                    scannedItem = item
                    showingScannedItem = true
                }
                
            } catch {
                await MainActor.run {
                    alertMessage = "Failed to load item: \(error.localizedDescription)"
                    showingAlert = true
                }
            }
        }
    }
    
    private func handleCompanyQRCode(_ code: String) {
        // Extract company code from QR code
        let companyCode = String(code.dropFirst(8)) // Remove "COMPANY_" prefix
        companyInviteCode = companyCode
        showingCompanyInvite = true
    }
    
    private func handleMoveQRCode(_ code: String) {
        // Extract move ID from QR code
        let moveId = String(code.dropFirst(5)) // Remove "MOVE_" prefix
        
        // Navigate to move details
        alertMessage = "Move QR code scanned. Navigate to move details."
        showingAlert = true
    }
}

// MARK: - Camera View
struct CameraView: UIViewRepresentable {
    @ObservedObject var scannerViewModel: QRScannerViewModel
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .black
        
        scannerViewModel.setupCamera(in: view)
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        // Update view if needed
    }
}

// MARK: - QR Scanner View Model
class QRScannerViewModel: ObservableObject {
    @Published var scannedCode: String?
    @Published var error: String?
    @Published var isLoading = false
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var isFlashOn = false
    
    func setupCamera(in view: UIView) {
        // Check camera authorization
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupCaptureSession(in: view)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                if granted {
                    DispatchQueue.main.async {
                        self?.setupCaptureSession(in: view)
                    }
                } else {
                    DispatchQueue.main.async {
                        self?.error = "Camera access is required to scan QR codes"
                    }
                }
            }
        case .denied, .restricted:
            error = "Camera access is required to scan QR codes"
        @unknown default:
            error = "Camera access is required to scan QR codes"
        }
    }
    
    private func setupCaptureSession(in view: UIView) {
        let session = AVCaptureSession()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else {
            error = "Camera not available"
            return
        }
        
        let videoInput: AVCaptureDeviceInput
        
        do {
            videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
        } catch {
            self.error = "Failed to initialize camera"
            return
        }
        
        if session.canAddInput(videoInput) {
            session.addInput(videoInput)
        } else {
            error = "Failed to add camera input"
            return
        }
        
        let metadataOutput = AVCaptureMetadataOutput()
        
        if session.canAddOutput(metadataOutput) {
            session.addOutput(metadataOutput)
            
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.qr]
        } else {
            error = "Failed to add metadata output"
            return
        }
        
        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.frame = view.layer.bounds
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
        
        self.captureSession = session
        self.previewLayer = previewLayer
        
        DispatchQueue.global(qos: .userInitiated).async {
            session.startRunning()
        }
    }
    
    func startScanning() {
        DispatchQueue.global(qos: .userInitiated).async {
            self.captureSession?.startRunning()
        }
    }
    
    func stopScanning() {
        DispatchQueue.global(qos: .userInitiated).async {
            self.captureSession?.stopRunning()
        }
    }
    
    func toggleFlash() {
        guard let device = AVCaptureDevice.default(for: .video) else { return }
        
        do {
            try device.lockForConfiguration()
            
            if device.hasTorch {
                if isFlashOn {
                    device.torchMode = .off
                } else {
                    try device.setTorchModeOn(level: 1.0)
                }
                isFlashOn.toggle()
            }
            
            device.unlockForConfiguration()
        } catch {
            print("Flash error: \(error)")
        }
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate
extension QRScannerViewModel: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first {
            guard let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject else { return }
            guard let stringValue = readableObject.stringValue else { return }
            
            // Stop scanning and process the code
            stopScanning()
            scannedCode = stringValue
            
            // Provide haptic feedback
            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
            impactFeedback.impactOccurred()
        }
    }
}

// MARK: - Supporting Views
struct QRCodeTypeBadge: View {
    let type: String
    let color: Color
    
    var body: some View {
        Text(type)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .cornerRadius(8)
    }
}

struct ScannedItemView: View {
    let item: Item
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Item Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(statusColor.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "cube.box.fill")
                                        .foregroundColor(statusColor)
                                        .font(.title2)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.name)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text("Status: \(item.packingStatus?.capitalized ?? "Unknown")")
                                    .font(.subheadline)
                                    .foregroundColor(statusColor)
                            }
                            
                            Spacer()
                        }
                        
                        if let description = item.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Item Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Item Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Weight", value: item.weight.map { "\($0) lbs" } ?? "Not specified")
                        DetailRow(title: "Value", value: item.value.map { "$\($0)" } ?? "Not specified")
                        DetailRow(title: "Fragile", value: item.isFragile ? "Yes" : "No")
                        
                        if let instructions = item.specialInstructions {
                            DetailRow(title: "Special Instructions", value: instructions)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Location Information
                    if let originRoom = item.originRoom {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Location")
                                .font(.headline)
                                .fontWeight(.semibold)
                            
                            DetailRow(title: "Origin Room", value: originRoom.name)
                            
                            if let destinationRoom = item.destinationRoom {
                                DetailRow(title: "Destination Room", value: destinationRoom.name)
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                    }
                    
                    // Photos
                    if !item.photos.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Photos")
                                .font(.headline)
                                .fontWeight(.semibold)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(item.photos) { photo in
                                        AsyncImage(url: URL(string: photo.url)) { image in
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                        } placeholder: {
                                            Rectangle()
                                                .fill(Color.gray.opacity(0.3))
                                        }
                                        .frame(width: 100, height: 100)
                                        .cornerRadius(8)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
            .navigationTitle("Item Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private var statusColor: Color {
        switch item.packingStatus?.lowercased() {
        case "unpacked": return .red
        case "packed": return .orange
        case "loaded": return .blue
        case "unloaded": return .green
        default: return .gray
        }
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

struct CompanyInviteView: View {
    let code: String
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = CompanyInviteViewModel()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 16) {
                    Image(systemName: "building.2.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    
                    Text("Company Invitation")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("You've been invited to join a company")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                
                // Company Code
                VStack(spacing: 12) {
                    Text("Company Code")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(code)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                }
                
                // Join Button
                Button(action: {
                    viewModel.joinCompany(code: code)
                }) {
                    HStack {
                        if viewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("Join Company")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(viewModel.isLoading)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Company Invite")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Company Invite", isPresented: $viewModel.showingAlert) {
                Button("OK") {
                    if viewModel.isSuccess {
                        dismiss()
                    }
                }
            } message: {
                Text(viewModel.alertMessage)
            }
        }
    }
}

class CompanyInviteViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var showingAlert = false
    @Published var alertMessage = ""
    @Published var isSuccess = false
    
    func joinCompany(code: String) {
        isLoading = true
        
        // Implement company join logic here
        // This would call the API to join the company
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.isLoading = false
            self.isSuccess = true
            self.alertMessage = "Successfully joined the company!"
            self.showingAlert = true
        }
    }
}

#Preview {
    QRScannerView()
} 