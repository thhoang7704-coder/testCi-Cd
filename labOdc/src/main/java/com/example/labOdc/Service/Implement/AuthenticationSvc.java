package com.example.labOdc.Service.Implement;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.AuthenticationRequest;
import com.example.labOdc.DTO.IntrospectRequest;
import com.example.labOdc.DTO.Response.AutheticationResponse;
import com.example.labOdc.DTO.Response.IntrospectResponse;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.PermissionEntity;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;
import com.example.labOdc.Repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationSvc {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // inject từ Spring

    @Value("${jwt.signer-key}")
    String SIGNER_KEY;

    // Kiểm tra token còn hợp lệ hay không
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        String token = request.getToken();
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        Date expiraTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        boolean verified = signedJWT.verify(verifier);

        return IntrospectResponse.builder()
                .valid(verified && expiraTime.after(new Date()))
                .build();
    }

    // Authenticate user và trả token
    public AutheticationResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = generateToken(user);
        return AutheticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    // Tạo JWT
    public String generateToken(User user) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUsername()) // dùng email làm subject
                    .issuer("dev")
                    .issueTime(new Date())
                    .expirationTime(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                    .claim("roles", user.getRoles().stream()
                            .map(RoleEntity::getRole)
                            .map(Enum::name)
                            .collect(Collectors.toList()))
                    .claim("permissions", user.getRoles().stream()
                            .flatMap(r -> r.getPermissions().stream())
                            .map(PermissionEntity::getCode)
                            .collect(Collectors.toList()))
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            signedJWT.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return signedJWT.serialize();

        } catch (JOSEException e) {
            throw new RuntimeException("Failed to generate token", e);
        }
    }
}
