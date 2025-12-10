# Build Stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
# Grant execution permission to gradlew
RUN chmod +x gradlew
# Build the application
RUN ./gradlew bootJar --no-daemon

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy only the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose the port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
