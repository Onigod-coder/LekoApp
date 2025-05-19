#!/bin/bash

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 60s

# Create database first
echo "Creating database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LekoStyle') CREATE DATABASE LekoStyle;"

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 30s

# Run the initialization script
echo "Running initialization script..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d LekoStyle -i /docker-entrypoint-initdb.d/init.sql

# Wait for initialization to complete
echo "Waiting for initialization to complete..."
sleep 30s

# Keep the container running
echo "Database initialization completed. Keeping container running..."
tail -f /dev/null 