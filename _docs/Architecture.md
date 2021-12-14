## Schema

**Users**

| Column | Remarks |
|--------|---------|
| uuid | Unique user uuid generated on registration. Used as sub |
| password | A user has only one password |
| profile | JSON Object of user information |
| status | active - in-active (Not added yet) |
| created_at | Self Explanatory |
| updated_at | Self Explanatory |

**Attributes**

| Column | Remarks |
|--------|---------|
| uuid | Primary key |
| user_uuid | User who owns the attribute |
| type | allowed_types configuration from ENV |
| value | Value of the attribute |
| purpose | Value of the attribute |
| verified_at | Date and Time or NULL |
| created_at | Self Explanatory |
| updated_at | Self Explanatory |

allowed_types: email, mobile, google, facebook, linkedin

**Tokens**

| Column | Remarks |
|--------|---------|
| uuid | Primary key and used as jti |
| of_uuid | User who owns the token |
| of_type | User who owns the token |
| abilities | JSONB |
| user_agent | JSONB |
| expires_at | When will this token expire |
| created_at | Self Explanatory |
| updated_at | Self Explanatory, also works as last_accessed_at |

**Verifications**

| Column | Remarks |
|--------|---------|
| uuid | Primary key |
| token | can be OTP or any string |
| attribute_type | Refer to allowed_types |
| attribute_value | Value |
| purpose | The purpose of verification might for registration, reset-password, login |
| expires_at | Self Explanatory |
| created_at | Self Explanatory |
| updated_at | Self Explanatory |