FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Grant execution rights on the gradlew wrapper
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew build -x test

# Run the jar file
# Assuming the jar is created in build/libs with a predictable name or finding it
CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"]
