<div align="center">
  <br />  
  <a href="https://school.eduva.tech/">
    <img src="public/images/logo.png" alt="EDUVA Logo" width="200"/>
  </a>
  <br/>
  <strong>A comprehensive educational platform for schools, teachers, and students</strong>
</div>

## 📋 Table of Contents

- [About Project](#about-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## About Project

Eduva School is a modern, comprehensive educational management platform designed to streamline the learning experience for schools, teachers, and students. Built with Angular 18 and modern web technologies, it provides a robust, scalable solution for educational institutions.

### Key Features:

- **Multi-role System**: Support for School Administrators, Teachers, Content Moderators, and Students
- **Dashboard Analytics**: Comprehensive statistics and insights for better decision-making
- **Lesson Management**: Create, edit, and manage educational content
- **Student Management**: Complete student information and progress tracking
- **Payment System**: Integrated payment processing for subscriptions and services
- **Content Moderation**: Built-in content review and approval system
- **Real-time Communication**: Live updates and notifications
- **File Management**: Advanced file handling with support for various media types

## 🛠 Built With

### Frontend Framework

- **[Angular 18](https://angular.io/)** - Modern web application framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### UI/UX Libraries

- **[PrimeNG](https://primeng.org/)** - Rich UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[FontAwesome](https://fontawesome.com/)** - Icon library
- **[ApexCharts](https://apexcharts.com/)** - Interactive charts and graphs

### Media & Content

- **[CKEditor 5](https://ckeditor.com/)** - Rich text editor
- **[VideoGular](https://videogular.com/)** - Video player
- **[Plyr](https://plyr.io/)** - Media player
- **[ngx-extended-pdf-viewer](https://www.npmjs.com/package/ngx-extended-pdf-viewer)** - PDF viewer

### Backend Integration

- **[Supabase](https://supabase.com/)** - Backend as a Service
- **[SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr)** - Real-time communication

### Development Tools

- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Prettier](https://prettier.io/)** - Code formatter
- **[Custom Webpack](https://github.com/angular-builders/custom-webpack)** - Custom build configuration

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 4GB RAM recommended
- Stable internet connection for backend services

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tranduckhuy/eduva-school.git
   cd eduva-school
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit environment file with your configuration
   # Required environment variables:
   # - BASE_API_URL: Your backend API URL
   # - BASE_HUB_URL: SignalR hub URL
   # - CLIENT_URL: Frontend application URL
   # - SUPABASE_URL: Supabase project URL (for image storage)
   # - SUPABASE_KEY: Supabase anonymous key (for image storage)
   ```

4. **Start development server**

   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 🎮 Usage

### For School Administrators

- **Dashboard**: View comprehensive school statistics and analytics
- **Content Moderator Management**: Add, edit, and manage content moderator accounts
- **Teacher Management**: Add, edit, and manage teacher accounts
- **Student Management**: Oversee student enrollment and progress
- **Payment Processing**: Handle subscription payments and billing
- **Content Moderation**: Review and approve educational content

### For Teachers

- **Lesson Creation**: Create interactive lessons with rich media
- **Student Progress**: Track individual student performance
- **Class Management**: Organize classes and assignments
- **AI Integration**: Generate lesson content using AI tools
- **File Management**: Upload and organize educational materials

### For Content Moderators

- **Content Review**: Review and approve submitted content
- **Quality Control**: Ensure educational content meets standards
- **Moderation Tools**: Advanced tools for content management

## 🔧 Available Scripts

```bash
# Development
npm start                  # Start development server
npm start:staging          # Start with staging configuration

# Building
npm run build              # Build for production
npm run build:staging      # Build for staging
npm run build:dev          # Build for development
npm run watch              # Build with watch mode

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:ui            # Run tests with UI
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/              # Core functionality (auth, guards, interceptors)
│   ├── features/          # Feature modules
│   │   ├── teacher/       # Teacher-specific features
│   │   ├── school-admin/  # School admin features
│   │   └── moderation/    # Content moderation
│   └── shared/            # Shared components and services
├── assets/                # Static assets
└── environments/          # Environment configurations
```

## 🔐 Environment Variables

The project uses `.env` files for environment configuration. The `.env` file is gitignored for security.

### Required Variables

```bash
# API Configuration
BASE_API_URL=your_backend_api_url
BASE_HUB_URL=your_signalr_hub_url
CLIENT_URL=your_frontend_url

# Supabase Storage
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### Setup Instructions

1. Create `.env` file
2. Copy `.env.example` to `.env`
3. Fill in your actual values

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow Angular style guide
- Write unit tests for new features
- Ensure code passes linting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ for better education</p>
  <p>© 2025 Eduva School. All rights reserved.</p>
</div>
