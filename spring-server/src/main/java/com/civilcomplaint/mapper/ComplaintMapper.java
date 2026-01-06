package com.civilcomplaint.mapper;

import com.civilcomplaint.entity.Complaint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ComplaintMapper {
    List<Complaint> findAll();

    List<Complaint> findByUserId(@Param("userId") Integer userId);

    Optional<Complaint> findById(@Param("id") Integer id);

    void insert(Complaint complaint);

    void update(Complaint complaint);

    void deleteById(@Param("id") Integer id);
}
