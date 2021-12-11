The idea of this microservice thought might feel like doing too many things, but it's to basically handle common scenarios of SaaS Applications. The following features are what I think should be handled when we kick-off:

1. Authentication
   - User should be able to register with email, mobile, login with Google
   - User should be able to Login and service issues an JWT API Token (More at JWT Token Properties)
   - User should be able to set and reset password
   - User should be able to verify attributes
   - User should be able to login with OTP
   - User should be able to login with Magic Link
   - Verify API Tokens
2. Identity
   - User should be able to update profile like name, picture.  
   - The identity can be simple json object
3. Teams
   - User should be able to create teams and manage team members
4. Subscriptions
   - Integrate Stripe subscriptions at user and team level
5. API Tokens
   - Users should be able to create API Tokens with abilities
6. Trusted Devices
   - Service should be able maintain a list of trusted devices