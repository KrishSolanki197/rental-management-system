
# Rental Management System's APIs
## APIs Endpoints, Request and Response Details

### Authentication APIs
- POST /auth/register 
```json
{
    "username": "harmin",
    "firstname": "Harmin",
    "lastname": "Vekariya",
    "phone": "8200571458",
    "email": "vekariyaharmin96@gmail.com",
    "password": "harmin@123"
}
```

- login 
- POST /auth/login
```json
{
    "email": "harmin@example.com", 
    "password": "password123"
}
```

- forget password
```json
{
    "email": "harmin@example.com"
}
```
- change password
- reset password
- logout
- email verifications
- otp verifications
- google oauth service