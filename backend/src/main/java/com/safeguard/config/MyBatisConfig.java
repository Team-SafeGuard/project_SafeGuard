package com.safeguard.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * MyBatis 설정 클래스입니다.
 * (한글 기능 설명: Mapper 인터페이스 스캔 경로 설정)
 */
@Configuration
// @MapperScan({ "com.safeguard.mapper", "com.safeguard.ljr.mapper" })
@MapperScan({ "com.safeguard.mapper" })
public class MyBatisConfig {

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        sessionFactory
                .setMapperLocations(
                        new PathMatchingResourcePatternResolver().getResources("classpath:mapper/**/*.xml"));
        sessionFactory.setTypeAliasesPackage("com.safeguard.dto");

        // This is important for mapping underscores to camelCase
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        sessionFactory.setConfiguration(configuration);

        return sessionFactory.getObject();
    }
}
