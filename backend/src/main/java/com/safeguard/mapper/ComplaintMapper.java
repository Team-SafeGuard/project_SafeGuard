package com.safeguard.mapper;

import com.safeguard.dto.ComplaintDTO;
import com.safeguard.entity.Complaint;
import com.safeguard.entity.SpatialFeature;
import com.safeguard.enums.ComplaintStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Mapper
public interface ComplaintMapper {
    List<ComplaintDTO> findAll(@Param("search") String search,
            @Param("category") String category,
            @Param("status") String status,
            @Param("region") String region,
            @Param("sort") String sort,
            @Param("order") String order,
            @Param("agencyNo") Long agencyNo);

    List<Map<String, Object>> getStats(@Param("agencyNo") Long agencyNo);

    List<ComplaintDTO> getTopLiked();

    boolean isLikedByUser(@Param("complaintNo") Long complaintNo, @Param("userNo") Long userNo);

    List<ComplaintDTO> findByUserNo(@Param("userNo") Long userNo);

    Optional<ComplaintDTO> findByComplaintNo(@Param("complaintNo") Long complaintNo);

    void insert(ComplaintDTO complaint);

    void update(ComplaintDTO complaint);

    void updateStatus(@Param("complaintNo") Long complaintNo, @Param("status") ComplaintStatus status);

    void updateAnswer(@Param("complaintNo") Long complaintNo, @Param("answer") String answer);

    void deleteByComplaintNo(@Param("complaintNo") Long complaintNo);

    void updateLikeCount(@Param("complaintNo") Long complaintNo);

    int checkUserLike(@Param("complaintNo") Long complaintNo, @Param("userNo") Long userNo);

    void insertLike(@Param("complaintNo") Long complaintNo, @Param("userNo") Long userNo);

    void deleteLike(@Param("complaintNo") Long complaintNo, @Param("userNo") Long userNo);

    void decreaseLikeCount(@Param("complaintNo") Long complaintNo);

    void deleteAllLikes();

    void deleteAllComplaints();

    // From origin/main
    void insertComplaint(Complaint complaint);

    void insertSpatialFeature(SpatialFeature spatialFeature);

    void insertComplaintAgency(@Param("complaintNo") Long complaintNo, @Param("agencyNo") Long agencyNo);
}
