const { sequelize } = require('../config/database');

const getAllUsers = async () => {
  const result = await sequelize.query(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           t.name AS team_name, t.id AS team_id
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    ORDER BY u.id
  `, { type: sequelize.QueryTypes.SELECT });
  return result;
};

const getUserById = async (id) => {
  const result = await sequelize.query(`
    SELECT u.id, u.name, u.email, u.role, u.team_id,
           t.name AS team_name
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    WHERE u.id = :id
  `, { replacements: { id }, type: sequelize.QueryTypes.SELECT });
  return result[0] || null;
};

const updateUser = async (id, { name, email, role, team_id }) => {
  await sequelize.query(`
    UPDATE users SET name = :name, email = :email, role = :role,
    team_id = :team_id, updated_at = NOW() WHERE id = :id
  `, { replacements: { id, name, email, role, team_id: team_id || null } });
  return getUserById(id);
};

const deleteUser = async (id) => {
  await sequelize.query(
    'DELETE FROM users WHERE id = :id',
    { replacements: { id } }
  );
};

const getAllTeams = async () => {
  const result = await sequelize.query(`
    SELECT t.id, t.name, t.created_at,
           COUNT(u.id)::int AS member_count
    FROM teams t
    LEFT JOIN users u ON u.team_id = t.id
    GROUP BY t.id
    ORDER BY t.id
  `, { type: sequelize.QueryTypes.SELECT });
  return result;
};

const createTeam = async (name) => {
  const result = await sequelize.query(
    'INSERT INTO teams (name) VALUES (:name) RETURNING *',
    { replacements: { name }, type: sequelize.QueryTypes.SELECT }
  );
  return result[0];
};

const deleteTeam = async (id) => {
  await sequelize.query(
    'DELETE FROM teams WHERE id = :id',
    { replacements: { id } }
  );
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getAllTeams, createTeam, deleteTeam };
