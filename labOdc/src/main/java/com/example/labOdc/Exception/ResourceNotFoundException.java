package com.example.labOdc.Exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, String fieldName, Object fieldValue) { // vd resource là thằng
                                                                                             // user, fieldName là
                                                                                             // trường để tìm kiếm như
                                                                                             // id, name, fieldValue là
                                                                                             // giá trị của nó
        super(String.format("%s not found with %s", resource, fieldName, fieldValue));
    }

}
