package com.civilcomplaint.repository;

import com.civilcomplaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Complaint> findAllByOrderByCreatedAtDesc();
}
