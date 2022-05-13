const knex = requireKnex();
const { promises: fs } = require("fs");

const getNumFiles = async (dir) => {
  const files = await fs.readdir(dir);
  return files.length;
};

module.exports = (app) => {
  try {
    app.get("/health", async (request, res) => {
      let numberOfFilesInMigrationPath = await getNumFiles(
        knex.migrate.config.migrationSource.migrationsPaths[0]
      );
      let numberOfMigrations = await knex("migrations")
        .count({ count: "*" })
        .first();
      numberOfMigrations = parseInt(numberOfMigrations.count);

      if (numberOfMigrations === numberOfFilesInMigrationPath) {
        return res.code(200).send({
          status: "Access service is healthy",
          npm_package_version: process.env.npm_package_version,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
          region: process.env.AWS_REGION || "na",
        });
      } else {
        return res.code(400).send({
          status: "Access is not alive",
        });
      }
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

          ["post", "/request-reset-password", "Users/RequestResetPassword"],
          ["post", "/reset-password", "Users/ResetPassword"],
          ["post", "/update-password", "Users/UpdatePassword"],

          // Login
          ["post", "/login", "Users/CanLogin"],
          ["get", "/user", "Users/ViewLoggedInUser"],
          ["post", "/user", "Users/UpdateUserProfile"],
          ["get", "/authorize", "Users/Authorize"],

          ["post", "/login/google", "Users/RedirectForLoginWithGoogle"],
          ["get", "/login/google", "Users/LoginWithGoogle"],

          ["post", "/login/otp", "Users/LoginWithOTP"],
          ["post", "/login/otp/initiate", "Users/InitiateLoginWithOTP"],

          ["get", "/logout", "Users/Logout"],
          ["get", "/sessions", "Users/GetSessions"],
          ["delete", "/sessions/:session_uuid", "Users/DestroySession"],

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
          [
            "put",
            "/teams/:team_uuid/tokens/:token_uuid",
            "Tokens/TeamAdminCanUpdateToken",
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
          [
            "put",
            "/teams/:team_uuid/members/:team_member_uuid/assign-role-permission",
            "TeamMembers/UserCanUpdateRolesAndPermissionsOfTeamMember",
          ],
        ],
      },
    ];
  } catch (error) {
    throw error;
  }
};
