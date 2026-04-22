package com.example.labOdc.Controller;

import java.text.ParseException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.AuthenticationRequest;
import com.example.labOdc.DTO.IntrospectRequest;
import com.example.labOdc.DTO.Response.AutheticationResponse;
import com.example.labOdc.DTO.Response.IntrospectResponse;
import com.example.labOdc.Service.Implement.AuthenticationSvc;
import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthenticationController {

    private final AuthenticationSvc authenticationSvc;

    @PostMapping("/token")
    public ApiResponse<AutheticationResponse> authenticated(
            @RequestBody AuthenticationRequest request) {

        AutheticationResponse result = authenticationSvc.authenticate(request);

        return ApiResponse.success(result, "success", HttpStatus.OK);
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(
            @RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {

        IntrospectResponse result = authenticationSvc.introspect(request);

        return ApiResponse.success(result, "success", HttpStatus.OK);
    }
}
