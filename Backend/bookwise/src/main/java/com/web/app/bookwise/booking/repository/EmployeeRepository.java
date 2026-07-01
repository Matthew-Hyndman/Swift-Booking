package com.web.app.bookwise.booking.repository;

import com.web.app.bookwise.booking.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    List<Employee> findByBusinessBusinessIdAndIsActiveTrueOrderByFirstNameAscLastNameAsc(Integer businessId);

    Optional<Employee> findByEmployeeIdAndBusinessBusinessIdAndIsActiveTrue(Integer employeeId, Integer businessId);
}
