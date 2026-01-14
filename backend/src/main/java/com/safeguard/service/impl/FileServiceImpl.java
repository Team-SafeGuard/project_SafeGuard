package com.safeguard.service.impl;

import com.safeguard.service.FileService;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final S3Template s3Template;

    // Prefer Spring property, but allow ECS env var injection without extra config
    @Value("${spring.cloud.aws.s3.bucket:${AWS_S3_BUCKET:}}")
    private String bucketName;

    @Value("${spring.cloud.aws.region.static:${AWS_REGION:ap-northeast-2}}")
    private String awsRegion;

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided or file is empty");
        }
        if (bucketName == null || bucketName.isBlank()) {
            throw new RuntimeException("S3 bucketName is not configured. Set spring.cloud.aws.s3.bucket or AWS_S3_BUCKET");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";

        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            int lastIndex = originalFileName.lastIndexOf('.');
            if (lastIndex != -1) {
                extension = originalFileName.substring(lastIndex);
            }

            String fileName = UUID.randomUUID().toString() + extension;

            // Upload to S3
            try (var in = file.getInputStream()) {
                s3Template.upload(bucketName, fileName, in);
            }

            // Return a predictable object URL (works when bucket/object is publicly readable)
            // If your bucket is private, you should instead return the key and generate a presigned URL via backend.
            String encodedKey = java.net.URLEncoder.encode(fileName, java.nio.charset.StandardCharsets.UTF_8)
                    .replace("+", "%20");
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, encodedKey);

        } catch (Exception ex) {
            // Log full root cause for CloudWatch debugging
            log.error("S3 upload failed. bucket={}, originalFileName={}, contentType={}, size={} bytes",
                    bucketName, originalFileName, file.getContentType(), file.getSize(), ex);
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}