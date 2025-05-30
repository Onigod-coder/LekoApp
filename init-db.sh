#!/bin/bash

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 60s

# Check if SQL Server is ready
echo "Checking if SQL Server is ready..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1" -b -o /dev/null
if [ $? -ne 0 ]; then
    echo "SQL Server is not ready. Waiting..."
    sleep 30s
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1" -b -o /dev/null
    if [ $? -ne 0 ]; then
        echo "SQL Server is still not ready. Exiting..."
        exit 1
    fi
fi

# Create database first
echo "Creating database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LekoStyle') CREATE DATABASE LekoStyle;"

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 30s

# Run the initialization script
echo "Running initialization script..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d LekoStyle -i /docker-entrypoint-initdb.d/init.sql

# Keep the container running
echo "Database initialization completed. Keeping container running..."
tail -f /dev/null 