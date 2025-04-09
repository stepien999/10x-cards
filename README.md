# 10x Cards

## Project Description

10x Cards is a flashcard application designed for professionals seeking efficient learning through flashcards. It allows users to generate flashcards automatically using AI based on pasted text, as well as create flashcards manually. The application supports flashcard management, including viewing, editing, and deleting cards, and integrates with a spaced repetition algorithm to optimize learning retention.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication)
- **AI Integration:** Openrouter.ai for accessing multiple AI models
- **CI/CD & Hosting:** GitHub Actions and DigitalOcean (Docker-based deployment)

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the environment:**
   - Ensure you have Node.js installed as specified in the `.nvmrc` file.
   - Create a `.env` file based on `.env.example` if available.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- **npm run dev:** Runs the application in development mode.
- **npm run build:** Builds the application for production.
- **npm run start:** Starts the production server.
- **npm run lint:** Lints the codebase for potential issues.
- **npm run format:** Formats the codebase according to project standards.

## Project Scope

This project is an MVP aimed at streamlining the process of flashcard creation and learning:

- **AI-generated Flashcards:** Automatically generate flashcard candidates from pasted text (with front text up to 200 characters and back text up to 500 characters).
- **Manual Flashcard Creation:** A form to manually create flashcards with similar character limits.
- **Flashcard Management:** View, edit, and delete flashcards with proper validation.
- **User Authentication:** Registration, login, password management, and account deletion.
- **Spaced Repetition Integration:** Accepted flashcards integrate seamlessly with a spaced repetition algorithm.
- **Operation Logging:** All flashcard generation operations are logged for performance analysis.

## Project Status

This project is under active development and currently in the MVP stage. Future enhancements will focus on user experience improvements and additional features based on user feedback.

## License

This project is licensed under the MIT License. 