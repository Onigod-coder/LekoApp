FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["LekoApp.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY wwwroot ./wwwroot
COPY ssl ./ssl

# Set environment variables for HTTPS
ENV ASPNETCORE_URLS="https://+:443;http://+:80"
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/app/ssl/lekoapp.pfx
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=YourStrong@Passw0rd

EXPOSE 80 443
ENTRYPOINT ["dotnet", "LekoApp.dll"] 