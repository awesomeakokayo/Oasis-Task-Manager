package com.oasis.taskmanager.repository;
import org.springframework.data.jpa.repository.JpaRepository; import com.oasis.taskmanager.model.User; import java.util.*;
public interface UserRepository extends JpaRepository<User,Long>{Optional<User> findByEmail(String email);}