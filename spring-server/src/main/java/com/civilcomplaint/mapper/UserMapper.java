package com.civilcomplaint.mapper;

import com.civilcomplaint.entity.AppUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface UserMapper {
    Optional<AppUser> findById(@Param("id") Integer id);

    Optional<AppUser> findByEmail(@Param("email") String email);

    boolean existsByEmail(@Param("email") String email);

    void insert(AppUser user);

    void update(AppUser user);

    void deleteById(@Param("id") Integer id);
}
