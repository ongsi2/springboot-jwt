package com.example.jwt.config;

import com.example.jwt.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .message(ex.getMessage())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleJsonException(HttpMessageNotReadableException ex) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .message("잘못된 JSON 형식입니다. 요청 데이터를 확인해주세요.")
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(
                        org.springframework.web.bind.MethodArgumentNotValidException ex) {
                String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .message(errorMessage)
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleException(Exception ex) {
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .message("서버 내부 오류가 발생했습니다.")
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }
}
