### Problem

Permissions are given to users, applications, roles. And roles are applied to users or applications. There are RBAC and ABAC which are pretty flexible. There are systems like OPA, Casbin etc., which handle many things very efficiently.

But we wanted something simple, and yet flexible for most of the business usecases. At the sametime, not too dependent on third party. All we want to do is, authorize our apis based on tokens passed in headers. And backend to help frontend to show/hide UI elements based on permissions.

Let's explore some use-cases we want to handle:

1. User has a Role in a Team, so, that role gives certain permissions - This is textbook RBAC.
2. User has a certain permission on a certain Entity
3. User has a certain permisson globally
4. User has a certain permission on an entity, which gives some permissions on children

Our attempt is to see if we can solve this in an extremely simple manner.

It seems to be most of systems finally boil down to something like:

- A Policy Document (which declares the policy itself)
- An Input (Current State of the System)
- Query (Run a query using the Input and check against policy document)

In PAHR Pattern - authorize function is present on all stories, so each story can become an action. So, we already list of possible actions a user can take.

Actions is nothing but a list of strings:

1. can_do_this
2. can_do_that

Decision point is all about, if an actor can perform that action in a given context.

The decision maker has to make a decision to allow or deny, or give all possible allows and denies if needed.

Decision makers can be as simple as function written in JS (Do we need to Rego?!). 

```js
userPermissionChecker(user_uuid, team_uuid, action){
    // Is user team member?
    // Get the role of the user
    // What are the actions possible for that role
    // Allow or Deny
}
```

```js
subscriptionLimitCheck(team_uuid, action){
    // Does this action need subscription
    // Check this action against limits 
}
```