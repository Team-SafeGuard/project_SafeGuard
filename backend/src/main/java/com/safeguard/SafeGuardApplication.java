package com.safeguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafeGuardApplication {

	public static void main(String[] args) {
		SpringApplication.run(SafeGuardApplication.class, args);
		System.out.println("Server Started");
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner initDB(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE complaint ADD COLUMN IF NOT EXISTS answer TEXT");
				System.out.println("Added answer column to complaint table");
			} catch (Exception e) {
				System.out.println("DB Update Note: " + e.getMessage());
			}
		};
	}

}
