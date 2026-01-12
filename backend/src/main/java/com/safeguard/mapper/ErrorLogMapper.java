package com.safeguard.mapper;

import com.safeguard.dto.ErrorLogDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ErrorLogMapper {
    void insertErrorLog(ErrorLogDTO errorLog);
}
