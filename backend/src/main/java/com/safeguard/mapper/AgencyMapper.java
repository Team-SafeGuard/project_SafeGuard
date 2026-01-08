package com.safeguard.mapper;

import com.safeguard.entity.Agency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AgencyMapper {
    void insertAgency(Agency agency);

    List<Agency> findAll();

    Agency findByNo(@Param("agencyNo") Long agencyNo);

    boolean existsByNameAndRegion(@Param("agencyName") String agencyName, @Param("regionCode") String regionCode);
}
