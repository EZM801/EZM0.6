import SwiftUI

// MARK: - Shared UI Components

// MARK: - Stat Card Component
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

// MARK: - Quick Action Card Component
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

// MARK: - Empty State Component
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?
    
    init(icon: String, title: String, message: String, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.icon = icon
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(message)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Loading View Component
struct LoadingView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.2)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Error View Component
struct ErrorView: View {
    let title: String
    let message: String
    let retryAction: (() -> Void)?
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(message)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            if let retryAction = retryAction {
                Button(action: retryAction) {
                    Text("Try Again")
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Custom Button Component
struct CustomButton: View {
    let title: String
    let icon: String?
    let style: ButtonStyle
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void
    
    enum ButtonStyle {
        case primary
        case secondary
        case destructive
        case outline
    }
    
    init(
        title: String,
        icon: String? = nil,
        style: ButtonStyle = .primary,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.style = style
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: textColor))
                        .scaleEffect(0.8)
                } else if let icon = icon {
                    Image(systemName: icon)
                        .font(.subheadline)
                }
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(backgroundColor)
            .foregroundColor(textColor)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(borderColor, lineWidth: style == .outline ? 1 : 0)
            )
        }
        .disabled(isLoading || isDisabled)
        .opacity(isDisabled ? 0.6 : 1.0)
    }
    
    private var backgroundColor: Color {
        switch style {
        case .primary:
            return isDisabled ? Color.gray : Color.blue
        case .secondary:
            return Color(.systemGray5)
        case .destructive:
            return Color.red
        case .outline:
            return Color.clear
        }
    }
    
    private var textColor: Color {
        switch style {
        case .primary, .destructive:
            return .white
        case .secondary, .outline:
            return .primary
        }
    }
    
    private var borderColor: Color {
        switch style {
        case .outline:
            return .blue
        default:
            return .clear
        }
    }
}

// MARK: - Custom Text Field Component
struct CustomTextField: View {
    let placeholder: String
    let icon: String?
    let text: Binding<String>
    let keyboardType: UIKeyboardType
    let textContentType: UITextContentType?
    let autocapitalization: TextInputAutocapitalization
    let isSecure: Bool
    
    init(
        placeholder: String,
        icon: String? = nil,
        text: Binding<String>,
        keyboardType: UIKeyboardType = .default,
        textContentType: UITextContentType? = nil,
        autocapitalization: TextInputAutocapitalization = .sentences,
        isSecure: Bool = false
    ) {
        self.placeholder = placeholder
        self.icon = icon
        self.text = text
        self.keyboardType = keyboardType
        self.textContentType = textContentType
        self.autocapitalization = autocapitalization
        self.isSecure = isSecure
    }
    
    var body: some View {
        HStack(spacing: 12) {
            if let icon = icon {
                Image(systemName: icon)
                    .foregroundColor(.secondary)
                    .frame(width: 20)
            }
            
            if isSecure {
                SecureField(placeholder, text: text)
                    .textFieldStyle(PlainTextFieldStyle())
            } else {
                TextField(placeholder, text: text)
                    .textFieldStyle(PlainTextFieldStyle())
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
        .keyboardType(keyboardType)
        .textContentType(textContentType)
        .autocapitalization(autocapitalization)
    }
}

// MARK: - Badge Component
struct Badge: View {
    let text: String
    let color: Color
    let size: BadgeSize
    
    enum BadgeSize {
        case small
        case medium
        case large
    }
    
    init(text: String, color: Color = .blue, size: BadgeSize = .medium) {
        self.text = text
        self.color = color
        self.size = size
    }
    
    var body: some View {
        Text(text)
            .font(fontSize)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, horizontalPadding)
            .padding(.vertical, verticalPadding)
            .background(color)
            .cornerRadius(cornerRadius)
    }
    
    private var fontSize: Font {
        switch size {
        case .small:
            return .caption2
        case .medium:
            return .caption
        case .large:
            return .subheadline
        }
    }
    
    private var horizontalPadding: CGFloat {
        switch size {
        case .small:
            return 6
        case .medium:
            return 8
        case .large:
            return 12
        }
    }
    
    private var verticalPadding: CGFloat {
        switch size {
        case .small:
            return 2
        case .medium:
            return 4
        case .large:
            return 6
        }
    }
    
    private var cornerRadius: CGFloat {
        switch size {
        case .small:
            return 6
        case .medium:
            return 8
        case .large:
            return 12
        }
    }
}

// MARK: - Card Component
struct Card<Content: View>: View {
    let content: Content
    let padding: CGFloat
    let cornerRadius: CGFloat
    let shadowRadius: CGFloat
    let shadowColor: Color
    
    init(
        padding: CGFloat = 16,
        cornerRadius: CGFloat = 12,
        shadowRadius: CGFloat = 3,
        shadowColor: Color = .black.opacity(0.05),
        @ViewBuilder content: () -> Content
    ) {
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.shadowRadius = shadowRadius
        self.shadowColor = shadowColor
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(Color(.systemBackground))
            .cornerRadius(cornerRadius)
            .shadow(color: shadowColor, radius: shadowRadius, x: 0, y: 1)
    }
}

// MARK: - Divider Component
struct CustomDivider: View {
    let color: Color
    let thickness: CGFloat
    
    init(color: Color = Color(.systemGray4), thickness: CGFloat = 1) {
        self.color = color
        self.thickness = thickness
    }
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(height: thickness)
    }
}

// MARK: - Section Header Component
struct SectionHeader: View {
    let title: String
    let subtitle: String?
    let actionTitle: String?
    let action: (() -> Void)?
    
    init(
        title: String,
        subtitle: String? = nil,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
            }
        }
    }
}

// MARK: - List Item Component
struct ListItem: View {
    let icon: String
    let title: String
    let subtitle: String?
    let trailing: String?
    let iconColor: Color
    let showChevron: Bool
    let action: () -> Void
    
    init(
        icon: String,
        title: String,
        subtitle: String? = nil,
        trailing: String? = nil,
        iconColor: Color = .blue,
        showChevron: Bool = true,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.trailing = trailing
        self.iconColor = iconColor
        self.showChevron = showChevron
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(iconColor)
                    .frame(width: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                if let trailing = trailing {
                    Text(trailing)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if showChevron {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Alert Component
struct CustomAlert: View {
    let title: String
    let message: String
    let primaryButtonTitle: String
    let secondaryButtonTitle: String?
    let primaryAction: () -> Void
    let secondaryAction: (() -> Void)?
    
    init(
        title: String,
        message: String,
        primaryButtonTitle: String,
        secondaryButtonTitle: String? = nil,
        primaryAction: @escaping () -> Void,
        secondaryAction: (() -> Void)? = nil
    ) {
        self.title = title
        self.message = message
        self.primaryButtonTitle = primaryButtonTitle
        self.secondaryButtonTitle = secondaryButtonTitle
        self.primaryAction = primaryAction
        self.secondaryAction = secondaryAction
    }
    
    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .multilineTextAlignment(.center)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            HStack(spacing: 12) {
                if let secondaryButtonTitle = secondaryButtonTitle {
                    CustomButton(
                        title: secondaryButtonTitle,
                        style: .outline
                    ) {
                        secondaryAction?()
                    }
                }
                
                CustomButton(
                    title: primaryButtonTitle,
                    style: .primary
                ) {
                    primaryAction()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        StatCard(
            title: "Active Moves",
            value: "5",
            icon: "truck.box.fill",
            color: .blue
        )
        
        QuickActionCard(
            title: "New Move",
            icon: "plus.circle.fill",
            color: .blue
        ) {
            print("Action tapped")
        }
        
        CustomButton(
            title: "Primary Button",
            icon: "plus",
            style: .primary
        ) {
            print("Primary button tapped")
        }
        
        CustomButton(
            title: "Secondary Button",
            style: .secondary
        ) {
            print("Secondary button tapped")
        }
        
        Badge(text: "New", color: .green)
        
        Card {
            Text("Card Content")
        }
    }
    .padding()
} 