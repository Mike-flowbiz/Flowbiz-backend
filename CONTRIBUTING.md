# Contributing to FlowBiz

Thank you for your interest in contributing to FlowBiz! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FlowBiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run prisma:push
   npm run prisma:generate
   ```

5. **Start development servers**
   ```bash
   # Run both frontend and backend
   npm run dev:all
   
   # Or run separately:
   npm run dev          # Frontend only
   npm run dev:backend  # Backend only
   ```

## Project Structure

```
FlowBiz/
├── src/
│   ├── app/              # Next.js pages and layouts
│   │   ├── (auth)/      # Authentication pages
│   │   └── (dashboard)/ # Dashboard pages
│   ├── backend/         # Express API server
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/  # Authentication, uploads
│   │   └── utils/       # S3, helpers
│   └── lib/             # Shared utilities
├── prisma/
│   └── schema.prisma    # Database schema
└── .github/             # CI/CD workflows
```

## Coding Standards

### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type when possible

### Code Style
- Run `npm run format` before committing
- Follow existing code patterns
- Use meaningful variable and function names

### Git Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Build process or auxiliary tool changes

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- Fill out the PR template completely
- Link related issues
- Ensure all CI checks pass
- Request review from maintainers
- Respond to feedback promptly

## Milestone Development

FlowBiz is developed in 10 structured milestones:

1. **Week 1** - Project Setup ✅
2. **Week 2** - Authentication & User Roles
3. **Week 3** - Dashboard & Analytics
4. **Week 4** - Clients Module
5. **Week 5** - Products/Services & Settings
6. **Week 6** - Invoicing Core
7. **Week 7** - PDF Generation
8. **Week 8** - Timesheets & Expenses
9. **Week 9** - Email & Client Portal
10. **Week 10** - Testing & Deployment

Check the README for detailed milestone breakdowns.

## Database Changes

When modifying the database schema:

1. Update `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npm run prisma:migrate
   ```
3. Test the migration thoroughly

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test manually in the browser

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

Thank you for contributing to FlowBiz! 🚀

