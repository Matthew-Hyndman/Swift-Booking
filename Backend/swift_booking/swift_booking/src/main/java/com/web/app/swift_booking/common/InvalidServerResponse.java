package com.web.app.swift_booking.common;


public class InvalidServerResponse extends RuntimeException {

    public InvalidServerResponse(String method,String message) {
        super(System.currentTimeMillis() + " | " + method + " | " + message);
    }

}
