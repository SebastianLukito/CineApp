# Web Tiket Bioskop 

This project is a web application for booking movie tickets and Final Exam of Web Programming built by:
Sebastianus Lukito (41522110051)

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js and npm.
- You have a running instance of MySQL (or any other specified database).

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd webTiketBioskop
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up the environment variables:
    - Create a `.env` file in the root directory and add the required environment variables as specified in `.env.example` or the following:
    ```env
    DB_HOST=<your-database-host>
    DB_USER=<your-database-username>
    DB_PASSWORD=<your-database-password>
    DB_NAME=<your-database-name>
    PORT=<your-server-port>
    ```

## Running the Server

1. Start the server:
    ```bash
    npm start
    ```

    This will run the server as specified in the `Procfile`.

## Database Setup

1. Ensure your MySQL (or specified database) is running.
2. Create the necessary database and tables. You can use a tool like MySQL Workbench or the command line to execute SQL scripts that create the required database schema. Example:
    ```sql
    CREATE DATABASE webTiketBioskop;
    ```

3. Update the `.env` file with your database credentials.

## Usage

Open your browser and go to `http://localhost:<your-server-port>` to access the application.

## Directory Structure

- `server.js`: Entry point for the server.
- `.env`: Environment variables.
- `package.json`: Project metadata and dependencies.
- `public/`: Contains HTML files for the front-end.

## Dependencies

Refer to `package.json` for a full list of dependencies.

## License

This project is licensed under the MIT License.
