# Существующий Dockerfile с добавлением api-gateway

# Этап сборки с Maven и Java 24
FROM maven:3.9-eclipse-temurin-24 AS build

# Аргумент для принудительной пересборки
ARG REBUILD_DATE=unknown

WORKDIR /app

# Добавляем переменную, которая будет меняться при каждой сборке
RUN echo "Rebuild date: $REBUILD_DATE" > rebuild_marker.txt

# Копирование и сборка проекта
COPY pom.xml .
COPY service-one/pom.xml service-one/
COPY service-two/pom.xml service-two/
COPY api-gateway/pom.xml api-gateway/

# Загрузка зависимостей
RUN mvn dependency:go-offline -B

# Копирование исходного кода
COPY service-one/src service-one/src
COPY service-two/src service-two/src
COPY api-gateway/src api-gateway/src

# Сборка проекта заново
RUN mvn clean package -DskipTests

# Образ для service-one
FROM eclipse-temurin:24-jre AS service-one
WORKDIR /app
COPY --from=build /app/service-one/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Образ для service-two
FROM eclipse-temurin:24-jre AS service-two
WORKDIR /app
COPY --from=build /app/service-two/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

# Образ для api-gateway
FROM eclipse-temurin:24-jre AS api-gateway
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]