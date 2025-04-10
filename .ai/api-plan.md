# REST API Plan

## 1. Resources

- **Users**: Represents application users.
  - *Database Table*: `users`
  - Managed thtough Supabase Auth; operations such as registration and login may be handled via Supabase or custom endpoints if needed.
- **Flashcards**: Represents individual flashcards.
  - *Database Table*: `flashcards`
  - Corresponds to the `flashcards` table.
  - Fields include `front` (max 200 characters), `back` (max 500 characters), `status` (allowed values: `pending`, `accepted`, `rejected`), and `source` (allowed values: `ai-full`, `ai-edited`, `manual`).
  - Each flashcard is linked to a user and, when generated, associated with a generation record via the `generation_id` field.
- **Generations**: Represents AI generation sessions.
  - *Database Table*: `generations`
  - Corresponds to the `generations` table.
  - Tracks metadata such as the AI model used, counts of generated flashcards, accepted counts (edited and unedited), and source text details (hash and length).
  - Each generation record is associated with a user.
- **Generation Error Logs**: Records errors encountered during AI generation operations.
  - *Database Table*: `generation_error_logs`
  - Corresponds to the `generation_error_logs` table.
  - Contains error codes, messages, and timestamps, linked to the user who initiated the generation.

## 2. Endpoints

### 2.1. Flashcards Endpoints

- **POST /flashcards**
  - **Description**: Create one or multiple flashcards (manual or AI-generated).
  - **Request JSON**:
    ```json
    {
      "flashcards": [
        {
          "front": "Short text up to 200 characters",
          "back": "Detailed explanation up to 500 characters",
          "source": "manual",
          "generation_id": "uuid (optional, required for ai-full and ai-edited)"
        }
      ]
    }
    ```
  - **Validations**:
    - `flashcards`: Required array of flashcard objects
    - For each flashcard:
      - `front`: Required, text, maximum 200 characters
      - `back`: Required, text, maximum 500 characters
      - `source`: Must be one of `ai-full`, `ai-edited`, or `manual`
      - `generation_id`: Required for flashcards with source `ai-full` or `ai-edited`
  - **Response JSON (201 Created)**:
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front": "Short text up to 200 characters",
          "back": "Detailed explanation up to 500 characters",
          "status": "accepted",
          "source": "manual",
          "generation_id": "uuid (if provided)",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "count": 1
    }
    ```
  - **Errors**: 400 for validation failures (e.g., text length exceeds limits).

- **GET /flashcards**
  - **Description**: Retrieve a paginated list of the user's flashcards.
  - **Query Parameters**:
    - `page` (default: 1)
    - `pageSize` (default: 20)
    - `sort` (e.g., `created_at:desc`)
  - **Response JSON (200 OK)**:
    ```json
    {
      "results": [
        {
          "id": "uuid",
          "front": "...",
          "back": "...",
          "status": "accepted",
          "source": "manual",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 20,
        "total": 100
      }
    }
    ```
  - **Errors**: 401 if unauthorized.

- **GET /flashcards/{id}**
  - **Description**: Retrieve details for a specific flashcard.
  - **Response JSON (200 OK)**:
    ```json
    {
      "id": "uuid",
      "front": "...",
      "back": "...",
      "status": "accepted",
      "source": "manual",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
  - **Errors**: 401 for unauthorized; 404 if flashcard not found.

- **PUT /flashcards/{id}**
  - **Description**: Update an existing flashcard (to edit its content).
  - **Request JSON**:
    ```json
    {
      "front": "Updated text up to 200 characters",
      "back": "Updated explanation up to 500 characters"
    }
    ```
  - **Response JSON (200 OK)**:
    ```json
    {
      "id": "uuid",
      "front": "Updated text",
      "back": "Updated explanation",
      "status": "accepted",
      "source": "manual",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```
  - **Errors**: 400 for validation errors; 401 for unauthorized; 404 if flashcard not found.

- **DELETE /flashcards/{id}**
  - **Description**: Delete a flashcard.
  - **Response**: 200 OK on successful deletion.
  - **Errors**: 401 for unauthorized; 404 if flashcard not found.

### 2.2. Generation Endpoints

- **POST `/generations`**
  - **Description**: Initiate the AI generation process for flashcards proposals based on user-provided text.
  - **Request JSON**:
    ```json
    {
      "text": "User provided text (1000 to 10000 characters)",
    }
    ```
  - **Business Logic**:
    - Validate that `text` length is between 1000 and 10000 characters.
    - Call the AI service to generate flashcards proposals.
    - Store the generation metadata and return flashcard proposals to the user.
  - **Response JSON**:
    ```json
    {
      "generation_id": 123,
      "flashcards_proposals": [
         { "front": "Generated Question", "back": "Generated Answer", "source": "ai-full" }
      ],
      "generated_count": 5
    }
    ```
  - **Errors**:
    - 400: Invalid input.
    - 500: AI service errors (logs recorded in `generation_error_logs`).

- **GET `/generations`**
  - **Description**: Retrieve a list of generation requests for the authenticated user.
  - **Query Parameters**: Supports pagination as needed.
  - **Response JSON**: List of generation objects with metadata.

- **GET `/generations/{id}`**
  - **Description**: Retrieve detailed information of a specific generation including its flashcards.
  - **Response JSON**: Generation details and associated flashcards.
  - **Errors**: 404 Not Found.

### 2.3. Generation Error Logs

*(Typically used internally or by admin users)*

- **GET `/generation-error-logs`**
  - **Description**: Retrieve error logs for AI flashcard generation for the authenticated user or admin.
  - **Response JSON**: List of error log objects.
  - **Errors**:
    - 401 Unauthorized if token is invalid.
    - 403 Forbidden if access is restricted to admin users.

## 3. Authentication & Authorization

- **Mechanism**: Token-based authentication using Supabase Auth.
- **Process**:
  - Users authenticate via `/auth/login` or `/auth/register`, receiving a bearer token.
  - Protected endpoints require the token in the `Authorization` header.
  - Database-level Row-Level Security (RLS) ensures that users access only records with matching `user_id`.
- **Additional Considerations**: Use HTTPS, rate limiting, and secure error messaging to mitigate security risks.

## 4. Validation & Business Logic

- **Validation Rules**:
  - **Flashcards**:
    - `front`: Maximum length of 200 characters.
    - `back`: Maximum length of 500 characters.
    - `source`: Must be one of `ai-full`, `ai-edited`, or `manual`.
  - **Generations**:
    - `source_text`: Must have a length between 1000 and 10000 characters.
    - `source_text_hash`: Computed for duplicate detection.

- **Business Logic Implementation**:
  - **AI Generation**:
    - Validate inputs and call the AI service upon POST `/generations`.
    - Record generation metadata (model, generated_count, duration) and send generated flashcards proposals to the user.
    - Log any errors in `generation_error_logs` for auditing and debugging.
  - **Flashcard Management**:
    - Automatic update of the `updated_at` field via database triggers when flashcards are modified.