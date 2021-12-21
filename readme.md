## Intro

Access is a deployed microservice to handle common use-cases around: Authentication, Authorization, Teams and Members, Subscriptions, API Keys, Validating Tokens. It uses JWT Tokens and at this point, doesn't support even Refresh Token.

It is built on and dependent on:

1. NodeJS
2. Postgres

### Links

- [APIs](_docs/APIs.md)

**Why we made this?**

We have been heavy users of Laravel who have been migration away from it. But we are amazed and still inspired by how amazing Laravel community is and their efforts towards making developers lives amazing.

For the use-cases of Auth, Teams etc., we are still using Laravel 7/8 as a Microservice, but we have been struggling to make work arounds. At NobeJS we have been trying to build Microservices which are deployable as containers - so you become Framework Agnostic. Instead of importing a third party package into your codebase, you import a container into your infrastructure. Felt much neater.

So, some decisions like using JWT etc., are keeping what [Sanctum](https://laravel.com/docs/8.x/sanctum) and other Laravel Packages are doing. We are already able to build successful applications using those concepts, we just want to replace it with something a bit more scalable and agnostic.

### Help Commands

- Prerelease:
  gh release create v1.1.2-alpha.8 --notes "v1.1.2-alpha.8" -p
