const baseRepo = requireUtil("baseRepo");
const table = "roles";
const underscoredColumns = requireUtil("underscoredColumns");

const getRoleForTeam = async (payload) => {
  try {
    let role = await baseRepo.first(table, payload);

    if (role === undefined) {
      throw role;
    }

    return role;
  } catch (error) {
    throw {
      statusCode: 404,
      message: "Role not found",
    };
  }
};

const updateRole = async (where, payload) => {
  try {
    return await baseRepo.update(table, where, payload);
  } catch (error) {
    throw {
      statusCode: 404,
      message: "Role not found",
    };
  }
};

const deleteRoleByUUID = async (uuid) => {
  return await baseRepo.remove(table, { uuid: uuid }, "hard");
};

const createRoleForTeam = async (payload) => {
  try {
    let role = await baseRepo.create(table, {
      owner_type: "team",
      title: payload.title,
      permissions: payload.permissions,
      owner_uuid: payload.team_uuid,
    });
    return role;
  } catch (error) {
    throw error;
  }
};

const getRolesForTeam = async (payload) => {
  try {
    return await baseRepo.findAll(
      table,
      {
        owner_type: "team",
        owner_uuid: payload.team_uuid,
      },
      underscoredColumns([
        "roles.uuid",
        "roles.title",
        "roles.permissions",
        "roles.created_at",
        "roles.updated_at",
      ])
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createRoleForTeam,
  updateRole,
  getRolesForTeam,
  getRoleForTeam,
  deleteRoleByUUID,
};
