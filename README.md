# 🔐 Spring Boot JWT Authentication System

> 현대적인 JWT 기반 인증 시스템 with Redis Blacklist & Refresh Token Rotation

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [보안 설계](#-보안-설계)
- [스크린샷](#-스크린샷)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 소개

이 프로젝트는 **프로덕션 수준의 JWT 인증 시스템**을 구현한 포트폴리오 프로젝트입니다.

### 왜 이 프로젝트를 만들었나요?

- ✅ **실무 수준의 보안**: Redis 기반 토큰 블랙리스팅으로 로그아웃 즉시 토큰 무효화
- ✅ **사용자 경험**: Refresh Token을 통한 자동 토큰 갱신 (무중단 인증)
- ✅ **관리자 기능**: 실시간 사용자 관리 및 강제 로그아웃 기능
- ✅ **포트폴리오 친화적**: 로그인 없이 시스템 아키텍처를 바로 확인 가능

---

## ✨ 주요 기능

### 🔑 인증 시스템
- **JWT 기반 인증**: Access Token (30분) + Refresh Token (7일)
- **자동 토큰 갱신**: 만료 전 자동으로 새 토큰 발급
- **Redis Blacklist**: 로그아웃 시 토큰 즉시 무효화 (탈취 방지)

### 👥 사용자 관리
- **회원가입/로그인**: BCrypt 암호화 기반 안전한 인증
- **역할 기반 접근 제어 (RBAC)**: USER, ADMIN 역할 구분
- **프로필 조회**: 인증된 사용자 정보 확인

### 🛡️ 관리자 대시보드
- **사용자 통계**: 전체/관리자 사용자 수 실시간 표시
- **사용자 목록**: 모든 등록 사용자 조회
- **강제 로그아웃**: Refresh Token 폐기로 특정 사용자 연결 해제

### 📚 공개 문서화
- **시스템 아키텍처**: 로그인 없이 인증 흐름 및 보안 설계 확인
- **포트폴리오 모드**: 리크루터가 즉시 기술 스택 확인 가능

---

## 🛠️ 기술 스택

### Backend
- **Spring Boot 3.2** - 최신 Java 프레임워크
- **Spring Security 6** - 보안 및 인증/인가
- **JJWT 0.12** - JWT 토큰 생성 및 검증
- **Spring Data JPA** - ORM 및 데이터베이스 접근

### Database & Cache
- **PostgreSQL 16** - 사용자 및 Refresh Token 저장
- **Redis 7** - Token Blacklist 및 캐싱

### Frontend
- **Vanilla JavaScript** - 순수 JS로 SPA 구현
- **Bootstrap 5** - 반응형 UI 디자인
- **Bootstrap Icons** - 아이콘 시스템

### DevOps
- **Docker & Docker Compose** - 컨테이너 기반 배포
- **Gradle** - 빌드 자동화

---

## 🚀 시작하기

### 사전 요구사항

- Java 17 이상
- Docker & Docker Compose
- (선택) Gradle 8.x

### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/jwt-auth-system.git
cd jwt-auth-system
```

### 2. Docker로 실행 (권장)

```bash
docker-compose up -d
```

### 3. 로컬 개발 환경

```bash
# Gradle로 실행
./gradlew clean bootRun

# 또는 JAR 빌드 후 실행
./gradlew build
java -jar build/libs/jwt-0.0.1-SNAPSHOT.jar
```

### 4. 접속

- **애플리케이션**: http://localhost:8081
- **공개 문서**: 로그인 화면에서 "시스템 아키텍처 보기" 클릭

### 테스트 계정

| 사용자명 | 비밀번호 | 역할 |
|---------|---------|------|
| admin   | admin123 | ADMIN |
| testuser | password | USER |

---

## 📡 API 문서

### 인증 API

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**응답:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

#### 토큰 갱신
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### 사용자 API

#### 내 정보 조회
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### 관리자 API

#### 전체 사용자 조회
```http
GET /api/admin/users
Authorization: Bearer {accessToken}
```

#### 사용자 강제 로그아웃
```http
DELETE /api/admin/users/{username}/kick
Authorization: Bearer {accessToken}
```

---

## 🔒 보안 설계

### 1. Dual Token 전략

```
┌─────────┐      ┌─────────┐      ┌──────────┐
│ Client  │─────▶│ Server  │─────▶│  Tokens  │
└─────────┘      └─────────┘      └──────────┘
   로그인          검증 & 발급      Access (30m)
                                  Refresh (7d)
```

- **Access Token**: 짧은 만료 시간 (30분), Stateless 검증
- **Refresh Token**: 긴 만료 시간 (7일), Redis에 저장하여 Stateful 관리

### 2. Redis Blacklist

로그아웃 시 Access Token을 Redis에 등록하여 **남은 유효 시간 동안** 재사용 차단:

```java
// 로그아웃 시
String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
long remainingTime = jwtProvider.getRemainingTime(token);
redisTemplate.opsForValue().set("blacklist:" + token, "true", remainingTime, TimeUnit.MILLISECONDS);
```

### 3. 보안 헤더

- **CORS**: 허용된 Origin만 접근 가능
- **CSRF**: Stateless JWT 사용으로 비활성화
- **XSS**: Content Security Policy 적용

---

## 📸 스크린샷

### 공개 아키텍처 문서
![시스템 아키텍처](docs/images/architecture.png)

### 관리자 대시보드
![관리자 대시보드](docs/images/dashboard.png)

---

## 📂 프로젝트 구조

```
jwt-auth-system/
├── src/
│   ├── main/
│   │   ├── java/com/example/jwt/
│   │   │   ├── config/          # Security, CORS 설정
│   │   │   ├── controller/      # REST API 엔드포인트
│   │   │   ├── domain/          # Entity 클래스
│   │   │   ├── dto/             # 데이터 전송 객체
│   │   │   ├── repository/      # JPA Repository
│   │   │   ├── security/        # JWT 필터, Provider
│   │   │   └── service/         # 비즈니스 로직
│   │   └── resources/
│   │       ├── static/          # 프론트엔드 (HTML, CSS, JS)
│   │       └── application.yml  # 애플리케이션 설정
├── docker-compose.yml           # Docker 구성
├── Dockerfile                   # 애플리케이션 이미지
└── README.md
```

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👨‍💻 개발자

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 감사의 말

이 프로젝트는 다음 기술들을 사용하여 만들어졌습니다:
- [Spring Boot](https://spring.io/projects/spring-boot)
- [JJWT](https://github.com/jwtk/jjwt)
- [Redis](https://redis.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Bootstrap](https://getbootstrap.com/)

---

<div align="center">
  <sub>Built with ❤️ for learning and portfolio purposes</sub>
</div>
