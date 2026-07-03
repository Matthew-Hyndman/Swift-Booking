package com.web.app.small-business-appointments.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.app.small-business-appointments.booking.entity.Employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    List<Employee> findByBusinessBusinessIdAndIsActiveTrueOrderByFirstNameAscLastNameAsc(Integer businessId);

    Optional<Employee> findByEmployeeIdAndBusinessBusinessIdAndIsActiveTrue(Integer employeeId, Integer businessId);
}
