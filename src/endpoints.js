module.exports = (app) => {
  try {
    app.get("/liveness", async (req, res) => {
      return res.code(200).send({ status: "Access service is alive" });
    });

    app.get("/readiness", async (req, res) => {
      return res.code(200).send({ status: "Access service is ready" });
    });

    return [
      {
        endpoints: [
          // Register
          ["post", "/register", "Users/CanRegister"],
          [
            "post",
            "/request-verify-registration",
            "Users/RequestVerifyRegistration",
          ],
          ["post", "/verify-registration", "Users/VerifyRegistration"],

          // Login
          ["post", "/login", "Users/CanLogin"],
          ["get", "/user", "Users/ViewLoggedInUser"],
          ["post", "/user", "Users/UpdateUserProfile"],
          ["get", "/authorize", "Users/Authorize"],

          // Teams
          ["get", "/teams", "Teams/UserCanViewTeams"],
          ["post", "/teams", "Teams/UserCanCreateTeam"],
          ["put", "/teams/:team_uuid", "Teams/UserCanUpdateTeam"],
          ["get", "/teams/:team_uuid", "Teams/UserCanViewTeam"],
          ["delete", "/teams/:team_uuid", "Teams/UserCanDeleteTeam"],

          // Teams Tokens
          [
            "post",
            "/teams/:team_uuid/tokens",
            "Tokens/TeamAdminCanCreateToken",
          ],
          ["get", "/teams/:team_uuid/tokens", "Tokens/TeamAdminCanGetTokens"],
          [
            "delete",
            "/teams/:team_uuid/tokens/:token_uuid",
            "Tokens/TeamAdminCanDeleteToken",
          ],

          // Roles
          ["post", "/teams/:team_uuid/roles", "Roles/TeamAdminCanCreateRole"],
          ["get", "/teams/:team_uuid/roles", "Roles/TeamAdminCanGetRoles"],
          [
            "get",
            "/teams/:team_uuid/roles/:role_uuid",
            "Roles/TeamAdminCanGetRole",
          ],
          [
            "put",
            "/teams/:team_uuid/roles/:role_uuid",
            "Roles/TeamAdminCanUpdateRole",
          ],
          [
            "delete",
            "/teams/:team_uuid/roles/:role_uuid",
            "Roles/TeamAdminCanDeleteRole",
          ],

          // Team Members
          ["get", "/teams/invites", "TeamMembers/UserCanViewInvites"],
          [
            "post",
            "/teams/:team_uuid/members",
            "TeamMembers/UserCanCreateTeamMember",
          ],
          [
            "post",
            "/teams/:team_uuid/members/:team_member_uuid/accept",
            "TeamMembers/UserCanAcceptTeamMembership",
          ],
          [
            "delete",
            "/teams/:team_uuid/members/:team_member_uuid",
            "TeamMembers/UserCanDeleteTeamMember",
          ],
          [
            "get",
            "/teams/:team_uuid/members",
            "TeamMembers/UserCanViewTeamMembers",
          ],
        ],
      },
    ];
  } catch (error) {
    console.log("13-error", error);
    throw error;
  }
};
